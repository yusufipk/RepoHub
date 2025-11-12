interface AurPackage {
  name: string
  version: string
  description: string
}

type AurRpcResult = {
  ID: number
  Name: string
  Version: string
  Description: string
}

type AurRpcResponse = {
  version: number
  type: string
  resultcount: number
  results: AurRpcResult[]
}

export class AurPackageFetcher {
  private rpcBase = 'https://aur.archlinux.org/rpc/?v=5&type=search&by=name&arg='
  private htmlBase = 'https://aur.archlinux.org/packages'

  private async sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms))
  }

  private async fetchWithUA(url: string) {
    return fetch(url, {
      headers: {
        'user-agent': 'RepoHubBot/0.1 (+https://repohub.local) NodeFetch',
        'accept': 'text/html,application/json;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9'
      }
    })
  }

  async fetchAllPackages(onProgress?: (current: number, total: number, sampleName: string) => void): Promise<AurPackage[]> {
    console.log('🅰️  Starting AUR package fetch via RPC...')

    const queries = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('')
    const seen = new Set<string>()
    const out: AurPackage[] = []
    let totalApprox = 0

    for (let i = 0; i < queries.length; i++) {
      const q = queries[i]
      const url = `${this.rpcBase}${encodeURIComponent(q)}`
      try {
        const res = await this.fetchWithUA(url)
        if (!res.ok) {
          console.warn(`AUR RPC failed for '${q}': ${res.status}`)
          continue
        }
        const data = (await res.json()) as AurRpcResponse
        totalApprox += data.resultcount || 0
        for (const r of data.results || []) {
          if (!seen.has(r.Name)) {
            seen.add(r.Name)
            out.push({
              name: r.Name,
              version: r.Version || 'latest',
              description: r.Description || `AUR package: ${r.Name}`
            })
          }
        }
        if (onProgress) onProgress(out.length, totalApprox || out.length, out[out.length - 1]?.name || q)
        // polite delay
        await this.sleep(120)
      } catch (e) {
        console.error(`AUR RPC error for '${q}':`, e)
      }
    }

    // If RPC yielded nothing (or environment blocks RPC), fallback to HTML scraping
    if (out.length === 0) {
      console.log('ℹ️ AUR RPC returned 0 results. Falling back to HTML scraping...')
      const htmlResults = await this.fetchAllPackagesHtml(onProgress)
      console.log(`✅ AUR HTML fetch completed! Rows: ${htmlResults.length}`)
      return htmlResults
    }

    console.log(`✅ AUR RPC fetch completed! Unique packages: ${out.length}`)
    return out
  }

  private async fetchAllPackagesHtml(onProgress?: (current: number, total: number, sampleName: string) => void): Promise<AurPackage[]> {
    const results: AurPackage[] = []
    let offset = 0
    const perPage = 50
    let total = 0

    // Try first page to detect total
    const firstUrl = `${this.htmlBase}?O=${offset}&SeB=nd&SB=p`
    console.log(`📄 AUR HTML: fetching first page ${firstUrl}`)
    const firstRes = await this.fetchWithUA(firstUrl)
    if (!firstRes.ok) throw new Error(`AUR HTML HTTP ${firstRes.status}`)
    const firstHtml = await firstRes.text()
    total = this.extractTotal(firstHtml) || 0
    const firstRows = this.parseAurRows(firstHtml)
    results.push(...firstRows)
    if (onProgress && firstRows.length) onProgress(results.length, total || results.length, results[results.length - 1].name)

    // Iterate subsequent pages until no rows
    while (true) {
      offset += perPage
      const url = `${this.htmlBase}?O=${offset}&SeB=nd&SB=p`
      console.log(`📄 AUR HTML: fetching offset ${offset}`)
      const res = await this.fetchWithUA(url)
      if (!res.ok) break
      const html = await res.text()
      const rows = this.parseAurRows(html)
      console.log(`🧩 AUR HTML: parsed ${rows.length} rows at offset ${offset}`)
      if (rows.length === 0) break
      results.push(...rows)
      if (onProgress) onProgress(results.length, total || results.length, rows[rows.length - 1].name)
      await this.sleep(100)
    }

    return results
  }

  private extractTotal(html: string): number | null {
    // Matches: "101725 packages found.\n  Page 1 of 2035."
    const m = html.match(/([0-9][0-9,.]*)\s+packages\s+found\./i)
    if (m) {
      const n = parseInt(m[1].replace(/[,\.]/g, ''))
      return Number.isFinite(n) ? n : null
    }
    return null
  }

  private parseAurRows(html: string): AurPackage[] {
    const out: AurPackage[] = []
    const rowBlockRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
    let rowMatch: RegExpExecArray | null
    while ((rowMatch = rowBlockRegex.exec(html)) !== null) {
      const row = rowMatch[1]
      const nameMatch = row.match(/<a\s+href="\/packages\/[^"]+"[^>]*>\s*([^<]+)\s*<\/a>/i)
      if (!nameMatch) continue
      const name = nameMatch[1].trim()
      // find version as the first <td> after the anchor
      const afterAnchorIndex = row.indexOf(nameMatch[0]) + nameMatch[0].length
      const afterAnchor = row.slice(afterAnchorIndex)
      const versionMatch = afterAnchor.match(/<td[^>]*>\s*([^<]+)\s*<\/td>/i)
      const version = (versionMatch?.[1] || '').trim()
      const descMatch = row.match(/<td[^>]*class="[^"]*wrap[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/td>/i)
      let description = (descMatch?.[1] || '').replace(/<[^>]*>/g, '').trim()
      if (!description && name) description = `AUR package: ${name}`
      if (name) {
        out.push({ name, version: version || 'latest', description })
      }
    }
    return out
  }

  async storePackages(packages: AurPackage[], onProgress?: (current: number, total: number) => void): Promise<void> {
    const { query } = await import('@/lib/database/config')
    console.log(`💾 Storing ${packages.length} AUR packages in database...`)

    const batchSize = 100
    let stored = 0
    let updated = 0
    let skipped = 0

    // Preflight: ensure DB constraint allows 'aur'
    try {
      const check = await query(
        "SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conname = 'packages_repository_check'"
      )
      const def = check.rows?.[0]?.def as string | undefined
      if (!def || !def.toLowerCase().includes("'aur'")) {
        throw new Error(
          "Database constraint 'packages_repository_check' does not include 'aur'. Please run scripts/migrate-add-aur-to-repository.sql before syncing AUR."
        )
      }
    } catch (prefErr) {
      console.error('[AUR] Preflight constraint check failed:', prefErr)
      throw prefErr
    }

    for (let i = 0; i < packages.length; i += batchSize) {
      const batch = packages.slice(i, i + batchSize)
      for (const pkg of batch) {
        try {
          const existing = await query(
            'SELECT id, version FROM packages WHERE name = $1 AND platform_id = $2',
            [pkg.name, 'arch']
          )
          if (existing.rows.length === 0) {
            await query(
              `INSERT INTO packages (id, name, description, version, platform_id, type, repository, popularity_score, is_active)
               VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)`,
              [pkg.name, pkg.description, pkg.version, 'arch', null, 'aur', 0, true]
            )
            stored++
          } else if (existing.rows[0].version !== pkg.version) {
            await query(
              `UPDATE packages SET version = $1, description = $2, repository = $3, updated_at = NOW() WHERE id = $4`,
              [pkg.version, pkg.description, 'aur', existing.rows[0].id]
            )
            updated++
          } else {
            skipped++
          }
          if (onProgress && (stored + updated + skipped) % 100 === 0) {
            onProgress(stored + updated + skipped, packages.length)
          }
        } catch (e: any) {
          if (e?.code === '23514') {
            console.error('[AUR] Constraint violation detected. Abort to avoid wasting time.')
            throw new Error(
              "Insert failed due to 'packages_repository_check'. Run scripts/migrate-add-aur-to-repository.sql to allow 'aur'."
            )
          }
          console.error(`Error storing AUR package ${pkg.name}:`, e)
        }
      }
    }
    console.log(`✅ AUR stored: ${stored} new, ${updated} updated, ${skipped} skipped`)
  }
}
