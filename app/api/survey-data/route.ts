/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { DATASET_URLS } from "@/lib/survey-data"

export async function GET() {
  try {
    // Fetch both datasets
    const [response1, response2] = await Promise.all([fetch(DATASET_URLS.dataset1), fetch(DATASET_URLS.dataset2)])

    const [csv1, csv2] = await Promise.all([response1.text(), response2.text()])

    // Parse CSV data
    const parseCSV = (csv: string) => {
      const lines = csv.trim().split("\n")
      const headers = lines[0].split(",").map((h) => h.trim())

      return lines
        .slice(1)
        .map((line) => {
          const values = line.split(",")
          const record: any = {}
          headers.forEach((header, index) => {
            record[header] = values[index]?.trim()
          })
          return record
        })
        .filter((record) => record.id)
    }

    const records1 = parseCSV(csv1)
    const records2 = parseCSV(csv2)

    // Combine and deduplicate
    const combined = [...records1, ...records2]
    const uniqueMap = new Map()
    combined.forEach((record) => {
      if (record.id && !uniqueMap.has(record.id)) {
        uniqueMap.set(record.id, record)
      }
    })

    const surveys = Array.from(uniqueMap.values())

    // Calculate statistics
    const years = surveys.map((s) => Number.parseInt(s.data_coll_start)).filter((y) => !isNaN(y))
    const minYear = Math.min(...years)
    const maxYear = Math.max(...years)

    return NextResponse.json({
      total_surveys: surveys.length,
      date_range: {
        start: minYear,
        end: maxYear,
      },
      surveys: surveys,
    })
  } catch (error) {
    console.error("[v0] Error fetching survey data:", error)
    return NextResponse.json({ error: "Failed to fetch survey data" }, { status: 500 })
  }
}
