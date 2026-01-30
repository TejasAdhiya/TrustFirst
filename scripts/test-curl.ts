const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCsj30jdybWVuJUVkn7JSCDNxDy7C29jJE";
// const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function test() {
    console.log("Testing Key ending in:", apiKey.slice(-4));
    try {
        const response = await fetch(url);

        const data = await response.json();
        if (response.ok) {
            console.log("Success! Available models (filtered for pro):");
            data.models.forEach((m: any) => {
                if (m.name.includes("pro")) {
                    console.log("- " + m.name);
                }
            });
        } else {
            console.error("Error:", response.status);
            console.error(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

test();
