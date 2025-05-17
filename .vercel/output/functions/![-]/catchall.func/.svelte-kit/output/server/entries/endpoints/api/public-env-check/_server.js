async function GET() {
  try {
    const envStatus = {
      MONGO_URI: process.env.MONGO_URI ? "✓ Configured" : "✗ Missing",
      JWT_SECRET: process.env.JWT_SECRET ? "✓ Configured" : "✗ Missing",
      SOCKET_SERVER_URL: process.env.SOCKET_SERVER_URL ? "✓ Configured" : "✗ Missing",
      NODE_ENV: process.env.NODE_ENV || "Not set"
    };
    const deploymentInfo = {
      region: process.env.VERCEL_REGION || "unknown",
      environment: process.env.VERCEL_ENV || "unknown",
      url: process.env.VERCEL_URL || "unknown"
    };
    async function getPublicIp() {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.error("Error getting public IP:", error);
        return "unknown";
      }
    }
    const publicIp = await getPublicIp();
    return new Response(
      JSON.stringify(
        {
          environment: envStatus,
          vercel: deploymentInfo,
          publicIp
        },
        null,
        2
      ),
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error checking environment:", error);
    return new Response(
      JSON.stringify(
        {
          error: "Failed to check environment variables",
          message: error instanceof Error ? error.message : String(error)
        },
        null,
        2
      ),
      {
        headers: { "Content-Type": "application/json" },
        status: 500
      }
    );
  }
}
export {
  GET
};
