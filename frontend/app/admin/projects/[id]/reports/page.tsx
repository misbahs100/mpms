"use client";

import { useEffect, useState } from "react";
import { getToken } from "../../../../../lib/utils";

export default function ProjectReport({ params }: any) {
  const { id } = params;
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/projects/${id}`, {headers: {Authorization: `Bearer ${token}`}})
      .then(res => res.json())
      .then(setReport);
  }, []);

  if (!report) return <div className="p-5">Loading report...</div>;

  return (
    <div className="p-5">
      <h1 className="uppercase text-xl font-bold mb-4"><span className=" text-blue-500">{report.projectDetail.title} </span>Report</h1>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div>Client: {report.projectDetail.client}</div>
        <div>Description: {report.projectDetail.description}</div>
        <div>Start Date: {report.projectDetail.start_date}</div>
        <div>End Date: {report.projectDetail.end_date}</div>
        <div className="font-semibold">
        Status: {report.projectDetail.status}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div>Total Tasks: {report.totalTasks}</div>
        <div>Completed: {report.doneTasks}</div>
        <div className="font-semibold">
          Progress: {report.progress}%
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="font-semibold mb-2">Remaining Tasks</h2>
        {report.remaining.map((r: any) => (
          <div key={r.status}>
            {r.status}: {r.count}
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Time Logged</h2>
        {report.timeByUser.map((t: any) => (
          <div key={t.name}>
            {t.name}: {Math.round(t.minutes / 60)} hrs
          </div>
        ))}
      </div>
    </div>
  );
}
