import os
import re

mapping = {
    "1": "vercel_pricing",
    "2": "nextjs",
    "3": "stackoverflow_2023_tech",
    "4": "supabase_pricing",
    "5": "prisma_docs",
    "6": "prisma_accelerate",
    "7": "inegi_endutih_2022",
    "8": "ibm_relational_db",
    "9": "inegi_denue_2024",
    "10": "inegi_canirac_2023",
    "11": "gonzalez_canirac_2024",
    "12": "toast_trends_2024",
    "13": "stps_observatorio",
    "14": "pmi_pmbok_7",
    "15": "oracle_consumer_study",
    "16": "toast_success_2023",
    "17": "nra_state_2023",
    "18": "yumminn_pricing",
    "19": "covermanager_pricing",
    "20": "lfpdppp",
    "21": "reglamento_lfpdppp",
    "22": "conasami_2024",
    "23": "pci_dss_4",
    "24": "stripe_pricing",
    "25": "conekta_pricing",
    "26": "cff_art29",
    "27": "sat_pac",
    "28": "lfpc",
    "29": "osi_licenses",
    "30": "supabase_license",
    "31": "lftr",
    "32": "state_of_js_2023",
    "33": "stackoverflow_2023_results",
    "34": "scrum_guide_2020",
    "35": "katagri_smart_2025",
    "36": "lee_digital_2024",
    "37": "wang_omnichannel_2024",
    "38": "tan_tabletop_2020",
    "39": "xu_mobile_2024",
    "40": "koay_qr_2024",
    "41": "hewage_qr_2024",
    "42": "ramirez_canirac_2025",
    "43": "yigitoglu_sustainable_2025",
    "44": "iovescu_realtime_2024",
    "45": "choo_qr_2023",
    "46": "alsaati_etipping_2026",
    "47": "bultel_faster_2020",
    "48": "toast_contactless_2026",
    "49": "square_pos_guide",
    "50": "lightspeed_restaurant",
    "51": "touchbistro_pos",
    "52": "nra_tech_landscape_2024",
    "53": "hrs_digital_transf",
    "54": "mdn_websocket",
    "55": "mdn_pwa",
    "56": "mdn_manifest",
    "57": "mdn_clientserver",
    "58": "denso_qr_standards",
    "59": "ibm_bi_intro",
    "60": "biomenus",
    "61": "loyverse_features",
    "62": "loyverse_restaurant",
    "63": "loyverse_kds",
    "64": "fitsmallbusiness_loyverse",
    "65": "posusa_loyverse",
    "66": "merchantmaverick_loyverse",
    "67": "menutiger_loyverse"
}

def replace_citations(text):
    # Regex to find [N], [N, M], [N], [M] etc.
    # We want to handle cases like [16], [17] -> \cite{toast_success_2023, nra_state_2023}
    
    # First, handle single citations [N]
    def sub_single(match):
        num = match.group(1)
        if num in mapping:
            return f"\\cite{{{mapping[num]}}}"
        return match.group(0)

    # Replace [N], [M] with [N, M] first? No, let's just handle individual ones.
    # But LaTeX handles \cite{a, b} better.
    
    # Let's handle groups of citations like [16], [17] or [16], [17], [18]
    # Regex for sequence: \[(\d+)\](?:,\s*\[(\d+)\])+
    def sub_multi(match):
        nums = re.findall(r'\[(\d+)\]', match.group(0))
        keys = [mapping[n] for n in nums if n in mapping]
        if keys:
            return f"\\cite{{{', '.join(keys)}}}"
        return match.group(0)

    text = re.sub(r'\[(\d+)\](?:,\s*\[(\d+)\])+', sub_multi, text)
    text = re.sub(r'\[(\d+)\]', sub_single, text)
    
    return text

sections_dir = "sections"
for filename in os.listdir(sections_dir):
    if filename.endswith(".tex"):
        path = os.path.join(sections_dir, filename)
        with open(path, "r") as f:
            content = f.read()
        
        new_content = replace_citations(content)
        
        if new_content != content:
            with open(path, "w") as f:
                f.write(new_content)
            print(f"Updated {filename}")
