def clean: gsub("^[[:space:]]+|[[:space:]]+$"; "") | gsub("[[:space:]]+"; " ");

($stops[0] | map({key: .id, value: .}) | from_entries) as $stopIndex
| ($lines[0] | map(.data.stopIds[]) | unique) as $referencedStopIds
| {
    schemaVersion: 1,
    generatedAt: $generatedAt,
    source: {
      app: "Amasya Ulaşım",
      package: "com.amasyaulasim.melrapp",
      appVersion: "2.5",
      mode: "static-snapshot"
    },
    summary: {
      lineCount: ($lines[0] | length),
      stopCount: ($stops[0] | length),
      referencedStopCount: ($referencedStopIds | length)
    },
    lines: [
      $lines[0][]
      | . as $line
      | ($line.data.returnStopId // null) as $returnStopId
      | ($line.data.stopIds | index($returnStopId)) as $returnStartIndex
      | {
          id: (
            if $line.number == "4." then "4-alt"
            elif $line.number == "4" and $line.data.direction == "üst" then "4-ust"
            else $line.number
            end
          ),
          sourceId: $line.id,
          number: ($line.number | sub("\\.$"; "")),
          variant: ($line.data.direction // null),
          name: ($line.name | clean),
          color: $line.color,
          description: ($line.data.description // ""),
          frequency: ($line.data.frequency // ""),
          from: ($line.data.from // ""),
          to: ($line.data.to // ""),
          returnStopId: $returnStopId,
          returnStartIndex: $returnStartIndex,
          route: $line.data.path,
          stops: [
            $line.data.stopIds
            | to_entries[]
            | .key as $sequence
            | $stopIndex[.value]
            | {
                sequence: $sequence,
                id: .id,
                number: .number,
                name: .name,
                lat: .lat,
                lng: .lng,
                direction: (
                  if $returnStartIndex == null then null
                  elif $sequence < $returnStartIndex then "outbound"
                  else "return"
                  end
                )
              }
          ],
          schedule: {
            weekday: ($line.data.schedule.weekday // []),
            saturday: ($line.data.schedule.saturday // []),
            sundayHoliday: ($line.data.schedule.sunday // [])
          }
        }
    ]
    | sort_by(
        (.number | tonumber),
        (if .variant == "üst" then 0 elif .variant == "alt" then 1 else 0 end)
      ),
    stops: [
      $stops[0][]
      | {
          id: .id,
          number: .number,
          name: .name,
          lat: .lat,
          lng: .lng,
          referencedByLine: (.id as $id | $referencedStopIds | index($id) != null)
        }
    ] | sort_by(.number, .name)
  }
