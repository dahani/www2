const http = require('https');

const candidates = {
    "vipere": [
        "Vipera_monticola1", "Vipera_monticola", "vipera_monticola1", "vipera_monticola",
        "Vipera-monticola", "vipera-monticola", "Vipere_de_latlas1", "Vipere_de_latlas",
        "vipere_de_latlas1", "vipere_de_latlas", "vipere-de-latlas", "vipere-de-latlas1",
        "Vipere_Atlas", "Vipere_Atlas1"
    ],
    "psammodrome": [
        "Psammodromus_microdactylus", "Psammodromus_microdactylus1", 
        "psammodromus_microdactylus", "psammodromus_microdactylus1",
        "Psammodromus-microdactylus", "psammodromus-microdactylus",
        "Atlantolacerta_andreanskyi", "Atlantolacerta_andreanskyi1",
        "atlantolacerta_andreanskyi", "atlantolacerta_andreanskyi1",
        "Atlantolacerta-andreanskyi", "atlantolacerta-andreanskyi",
        "Psammodrome_vert", "Psammodrome_vert1", "psammodrome_vert", "psammodrome_vert1",
        "psammodrome-vert", "psammodrome-vert1"
    ],
    "discoglosse": [
        "Discoglossus_scovazzi", "Discoglossus_scovazzi1", 
        "discoglossus_scovazzi", "discoglossus_scovazzi1",
        "Discoglossus-scovazzi", "discoglossus-scovazzi",
        "Discoglosse_peint_du_maroc", "Discoglosse_peint_du_maroc1",
        "discoglosse_peint_du_maroc", "discoglosse_peint_du_maroc1",
        "Discoglosse-peint-du-maroc", "discoglosse-peint-du-maroc", "discoglosse-peint-du-maroc1",
        "Discoglosse_peint", "Discoglosse_peint1", "discoglosse_peint", "discoglosse_peint1",
        "discoglosse-peint", "discoglosse-peint1"
    ],
    "tortue": [
        "Testudo_graeca", "Testudo_graeca1", "testudo_graeca", "testudo_graeca1",
        "Testudo-graeca", "testudo-graeca", "Tortue_grecque", "Tortue_grecque1",
        "tortue_grecque", "tortue_grecque1", "Tortue-grecque", "tortue-grecque",
        "Tortue-grecque1", "tortue-grecque1"
    ]
};

const months = ["07", "11", "12"];
const years = ["2025"];
const extensions = ["jpg", "webp"];

function checkUrl(category, url) {
    return new Promise((resolve) => {
        const req = http.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
            if (res.statusCode === 200) {
                console.log(`[FOUND] Category: ${category} | URL: ${url}`);
                resolve(url);
            } else {
                resolve(null);
            }
        });
        req.on('error', () => resolve(null));
        req.on('timeout', () => {
            req.destroy();
            resolve(null);
        });
        req.end();
    });
}

async function main() {
    const urlsToCheck = [];
    for (const [cat, names] of Object.entries(candidates)) {
        for (const name of names) {
            for (const year of years) {
                for (const month of months) {
                    for (const ext of extensions) {
                        const url = `https://ifrane.pnm.ma/wp-content/uploads/${year}/${month}/${name}.${ext}`;
                        urlsToCheck.push({ cat, url });
                    }
                }
            }
        }
    }

    console.log(`Starting probe for ${urlsToCheck.length} candidate URLs...`);
    
    // Process in batches to avoid overwhelming the target or environment limits
    const batchSize = 100;
    for (let i = 0; i < urlsToCheck.length; i += batchSize) {
        const batch = urlsToCheck.slice(i, i + batchSize);
        await Promise.all(batch.map(item => checkUrl(item.cat, item.url)));
    }
    console.log("Done probing.");
}

main();
