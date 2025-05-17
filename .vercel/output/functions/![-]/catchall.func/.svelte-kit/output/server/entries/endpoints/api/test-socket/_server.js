import { j as json } from "../../../../chunks/index.js";
async function POST({ request }) {
  try {
    const data = await request.json();
    const { action, userId, groupId } = data;
    console.log("Test socket action:", action, { userId, groupId });
    if (action === "direct:group_invite") {
      const socketServerUrl2 = "http://localhost:3001/api/direct-invite";
      const response2 = await fetch(socketServerUrl2, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          targetUserId: userId,
          groupId: groupId || "test-group-direct",
          groupName: "Test Direct Invitation Group",
          inviterName: "Test Admin"
        })
      }).catch((error) => {
        console.error("Error connecting to socket server for direct invite:", error);
        return {
          ok: false,
          error: `Socket server not reachable: ${error instanceof Error ? error.message : String(error)}`
        };
      });
      if (!response2.ok) {
        return json({
          success: false,
          message: "Failed to connect to socket server for direct invite"
        });
      }
      return json({
        success: true,
        message: "Direct group invitation sent successfully"
      });
    }
    const socketServerUrl = "http://localhost:3001/api/test-event";
    const response = await fetch(socketServerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action,
        userId,
        groupId,
        // Additional data based on action type
        ...action === "todo:completed" && {
          todo: {
            _id: `test_${Date.now()}`,
            title: `Task marked as complete at ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`
          },
          groupName: "Test Group",
          username: "Test User"
        },
        ...action === "group:user_role_changed" && {
          groupName: "Test Group",
          newRole: "Co-Leader",
          adminName: "Admin User"
        },
        ...action === "group:user_removed" && {
          groupName: "Test Group",
          adminName: "Admin User"
        },
        ...action === "group:invite" && {
          groupName: "Test Group Invitation",
          username: "Test Admin"
        }
      })
    }).catch((error) => {
      console.error("Error connecting to socket server:", error);
      return {
        ok: false,
        error: `Socket server not reachable: ${error instanceof Error ? error.message : String(error)}`
      };
    });
    if (!response.ok) {
      return json({
        success: false,
        message: "Failed to connect to socket server"
      });
    }
    return json({
      success: true,
      message: "Socket test action triggered successfully"
    });
  } catch (error) {
    console.error("Error in test-socket endpoint:", error);
    return json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}
export {
  POST
};
