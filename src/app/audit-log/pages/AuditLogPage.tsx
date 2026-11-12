import { useState } from "react";
import { Activity } from "lucide-react";
import { Metadata } from "@/app/audit-log/components/Metadata";
import {
  actorText,
  targetText,
} from "@/app/audit-log/components/audit-log-helpers";
import { useGetAuditLogs } from "@/hooks/api/audit-log";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeading,
  Pagination,
  formatDate,
  getErrorMessage,
} from "@/components/ui";

export function AuditPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const logs = useGetAuditLogs(page, limit);

  return (
    <>
      <PageHeading
        eyebrow="ความปลอดภัยและการตรวจสอบ"
        title="ประวัติการเปลี่ยนแปลง"
        description="ตรวจสอบผู้ดำเนินการ รายการที่เปลี่ยนแปลง และรายละเอียดจากระบบ"
      />
      {logs.isLoading ? (
        <LoadingState label="กำลังโหลด audit log" />
      ) : logs.error ? (
        <ErrorState
          message={getErrorMessage(logs.error)}
          onRetry={() => void logs.refetch()}
        />
      ) : !logs.data?.items.length ? (
        <EmptyState
          title="ยังไม่มีประวัติการเปลี่ยนแปลง"
          description="เมื่อมีรายการ audit log จาก API จะแสดงที่นี่"
        />
      ) : (
        <section className="panel table-panel">
          <div className="table-heading">
            <div>
              <strong>
                <Activity size={16} /> รายการ audit log
              </strong>
              <span>{logs.data.total.toLocaleString("th-TH")} รายการ</span>
            </div>
            <span className="table-context">เวลาแสดงตามเขตเวลาของเครื่อง</span>
          </div>
          <div className="table-scroll">
            <table className="data-table audit-table">
              <thead>
                <tr>
                  <th>ผู้ดำเนินการ</th>
                  <th>รายการ</th>
                  <th>เป้าหมาย</th>
                  <th>เวลา</th>
                  <th>Metadata</th>
                </tr>
              </thead>
              <tbody>
                {logs.data.items.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="audit-actor">
                        <div className="actor-dot" />
                        <div>
                          <strong>{actorText(record)}</strong>
                          {record.actorEmail && (
                            <small>{record.actorEmail}</small>
                          )}
                          {!record.actorEmail && record.userId && (
                            <small>ID: {record.userId}</small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <code>{record.action}</code>
                    </td>
                    <td>{targetText(record)}</td>
                    <td>{formatDate(record.createdAt)}</td>
                    <td>
                      <Metadata value={record.metadata} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="audit-mobile-list mobile-only">
            {logs.data.items.map((record) => (
              <article className="audit-mobile-item" key={record.id}>
                <div className="audit-mobile-top">
                  <strong>{actorText(record)}</strong>
                  <span>{formatDate(record.createdAt)}</span>
                </div>
                <code>{record.action}</code>
                <p>{targetText(record)}</p>
                <Metadata value={record.metadata} />
              </article>
            ))}
          </div>
          <Pagination
            page={logs.data.page}
            limit={logs.data.limit}
            total={logs.data.total}
            onPage={setPage}
            onLimit={(next) => {
              setLimit(Math.min(100, next));
              setPage(1);
            }}
          />
        </section>
      )}
    </>
  );
}
