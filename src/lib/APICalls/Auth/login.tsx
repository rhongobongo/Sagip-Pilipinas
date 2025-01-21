export const loginWithCredentials = async (token: string) => {
    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({}),
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Login success:", data);
        } else {
            console.error("Error:", data.error);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}