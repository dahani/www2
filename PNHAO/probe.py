import asyncio
import aiohttp
import sys

# Define candidates
candidates = {
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
}

months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
years = ["2025", "2024", "2023"]

async def check_url(session, category, url):
    try:
        async with session.head(url, allow_redirects=True, timeout=10) as response:
            if response.status == 200:
                print(f"[FOUND] Category: {category} | URL: {url}", flush=True)
                return url
    except Exception:
        pass
    return None

async def main():
    async with aiohttp.ClientSession() as session:
        tasks = []
        for cat, names in candidates.items():
            for name in names:
                for year in years:
                    for month in months:
                        for ext in ["jpg", "jpeg", "webp", "png"]:
                            url = f"https://ifrane.pnm.ma/wp-content/uploads/{year}/{month}/{name}.{ext}"
                            tasks.append(check_url(session, cat, url))
        
        print(f"Starting probe for {len(tasks)} candidate URLs...")
        await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())
