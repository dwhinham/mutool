const fs = require("fs");
const csv = require("fast-csv");

const MUExtension = {
    None: 0,
    MU80: 1,
    MU90: 2,
    MU100: 3,
    MU128: 4,
    MU1000_2000: 5
};

const parseName = (name) => {
    let extension;

    if (name.includes("****")) {
        name = name.replace("****", "").trim();
        extension = MUExtension.MU100;
    } else if (name.includes("***")) {
        name = name.replace("***", "").trim();
        extension = MUExtension.MU90;
    } else if (name.includes("**")) {
        name = name.replace("**", "").trim();
        extension = MUExtension.MU80;
    } else if (name.includes("†††")) {
        name = name.replace("†††", "").trim();
        extension = MUExtension.MU1000_2000;
    } else if (name.includes("††")) {
        name = name.replace("††", "").trim();
        extension = MUExtension.MU128;
    }

    return { name, extension };
}

var notes = [];
var drumKits = [];
var csvData = [];

fs.createReadStream("MU2000 List Book - XG Drum Map.csv")
  .pipe(csv.parse({ maxRows: 83 }))
  .on("data", (data) => {
    csvData.push(data);
  })
  .on("end", () => {
    transposedData = csvData[0].map((_, colIndex) =>
      csvData.map((row) => row[colIndex])
    );

    notes = csvData.slice(4).map((data, _) => ({
            number: parseInt(data[0]),
            name: data[1],
            key_off: !!data[2],
            alt_group: parseInt(data[3]) || undefined
        }));

    const kits = transposedData.slice(4);
    for (let i = 0; i < kits.length; i += 2) {
        const firstCol = kits[i];
        const secondCol = kits[i + 1];

        const kitNameAndExt = parseName(firstCol[3]);
        const msb = parseInt(firstCol[0]);

        let drumKit = {
            name: kitNameAndExt.name
        }

        if (kitNameAndExt.extension) {
            drumKit.extension = kitNameAndExt.extension;
        }

        drumKit = {
            ...drumKit,
            msb,
            lsb: parseInt(firstCol[1]),
            program: parseInt(firstCol[2]),
            notes: firstCol.slice(4).map((data, noteIndex) => {
                const noteNameAndExt = parseName(data);

                if (noteNameAndExt.name) {
                    return {
                        ...noteNameAndExt,
                        elements: parseInt(secondCol[noteIndex + 4])
                    };
                }

                // Empty object - same as Std Kit
                if (noteIndex < 72 && msb === 127 ) {
                    return {};
                }

                // Undefined - no sound
            })
        }

        drumKits.push(drumKit);

        fs.writeFileSync('../src/xg_drum_kits.json', JSON.stringify({ notes, drum_kits: drumKits }, null, 2));
    }
  });
