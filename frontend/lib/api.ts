function getToken() { return (typeof window!=='undefined') ? localStorage.getItem('mpms_token') : null; }


export async function getTasksBySprint(projectId: string, sprintId: string) {
    // const url = `${process.env.NEXT_PUBLIC_API_URL}/api/tasks?project_id=${projectId}&sprint_id=${sprintId}`;
    const token = getToken();

    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/sprints/${sprintId}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
    console.log(res)
    const data = await res.json();
    return data.tasks;
  }

  
  export async function createTask(data: any) {
    const token = getToken();

    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }

    try {
        console.log("fetch is called")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        // credentials: "include",
        body: JSON.stringify(data),
      });

    //   if (!res.ok) {
    //     const errorMessage = `HTTP error! status: ${res.status}`;
    //     console.error(errorMessage);
    //     throw new Error(errorMessage);
    //   }

      return await res.json();
    } catch (error) {
      if (error instanceof TypeError) {
        console.error("Network error or invalid API URL:", error);
        throw new Error("Failed to connect to the server. Please check your network connection or API URL.");
      } else {
        console.error("Failed to fetch:", error);
        throw error;
      }
    }
  }
  
  export async function updateTask(id: string, data: any) {
    const token = getToken();

    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    //   credentials: "include",
      body: JSON.stringify(data),
    });
    return res.json();
  }
  
  export async function deleteTask(id: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    return res.json();
  }
  