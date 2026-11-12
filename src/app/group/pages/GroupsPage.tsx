import { usePermission } from "@/hooks/api/access";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import { useGetGroups } from "@/hooks/api/group";
import { GroupAvatar } from "@/app/group/components/GroupAvatar";
import { isSystemGroup } from "@/app/group/components/group-helpers";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeading,
  Pagination,
  SearchForm,
  StatusBadge,
  getErrorMessage,
} from "@/components/ui";

export function GroupsPage() {
  const can = usePermission();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const groups = useGetGroups(q, page, limit);
  return (
    <>
      <PageHeading
        eyebrow="สิทธิ์และการเข้าถึง"
        title="กลุ่ม"
        description="กลุ่มจะรวมสิทธิ์และสมาชิกที่ใช้งานร่วมกัน"
        actions={
          can("core_group:create") ? <Link className="button button-primary" to="/groups/new">
            <Plus size={17} /> สร้างกลุ่ม
          </Link> : undefined
        }
      />
      <section className="panel filter-panel">
        <div className="filter-label">
          <span className="eyebrow">ค้นหากลุ่ม</span>
          <span className="filter-note">ค้นหาด้วยชื่อกลุ่ม</span>
        </div>
        <SearchForm
          value={q}
          placeholder="ชื่อกลุ่ม"
          onSubmit={(value) => {
            setQ(value.trim());
            setPage(1);
          }}
        />
      </section>
      {groups.isLoading ? (
        <LoadingState label="กำลังโหลดกลุ่ม" />
      ) : groups.error ? (
        <ErrorState
          message={getErrorMessage(groups.error)}
          onRetry={() => void groups.refetch()}
        />
      ) : !groups.data?.items.length ? (
        <EmptyState
          title={q ? "ไม่พบกลุ่มที่ตรงกับการค้นหา" : "ยังไม่มีกลุ่ม"}
          description={
            q
              ? "ลองค้นหาด้วยคำอื่น"
              : "สร้างกลุ่มเพื่อเริ่มกำหนดสิทธิ์และสมาชิก"
          }
          action={
            !q && can("core_group:create") && (
              <Link
                className="button button-primary button-small"
                to="/groups/new"
              >
                <Plus size={15} /> สร้างกลุ่ม
              </Link>
            )
          }
        />
      ) : (
        <section className="panel table-panel">
          <div className="table-heading">
            <div>
              <strong>กลุ่มทั้งหมด</strong>
              <span>{groups.data.total.toLocaleString("th-TH")} กลุ่ม</span>
            </div>
            <span className="table-context">สถานะและจำนวนสิทธิ์จาก API</span>
          </div>
          <div className="table-scroll desktop-only">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ชื่อกลุ่ม</th>
                  <th>คำอธิบาย</th>
                  <th>สถานะ</th>
                  <th>สิทธิ์</th>
                  <th>สมาชิก</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {groups.data.items.map((group) => (
                  <tr key={group.id}>
                    <td>
                      <div className="person-cell">
                        <GroupAvatar />
                        <div>
                          <strong>{group.name}</strong>
                          <small>
                            {isSystemGroup(group)
                              ? "กลุ่มระบบ"
                              : `ID: ${group.id}`}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted group-description-cell">
                      {group.description || "—"}
                    </td>
                    <td>
                      <StatusBadge tone={group.active ? "success" : "neutral"}>
                        {group.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </StatusBadge>
                    </td>
                    <td>
                      {group.permissionCount ?? group.permissions?.length ?? "—"}
                    </td>
                    <td>
                      {group.memberCount ??
                        group.members?.length ??
                        group.users?.length ??
                        "—"}
                    </td>
                    <td>
                      <Link
                        className="icon-button row-open"
                        to={`/groups/${group.id}`}
                        aria-label={`ดูกลุ่ม ${group.name}`}
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-record-list mobile-only">
            {groups.data.items.map((group) => (
              <Link
                className="mobile-record"
                to={`/groups/${group.id}`}
                key={group.id}
              >
                <div className="mobile-record-main">
                  <GroupAvatar />
                  <div>
                    <strong>{group.name}</strong>
                    <span>{group.description || "ไม่มีคำอธิบาย"}</span>
                  </div>
                  <ChevronRight size={17} />
                </div>
                <div className="mobile-record-meta">
                  <StatusBadge tone={group.active ? "success" : "neutral"}>
                    {group.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  </StatusBadge>
                  {isSystemGroup(group) && (
                    <StatusBadge tone="accent">กลุ่มระบบ</StatusBadge>
                  )}
                  <span>
                    {group.permissionCount ?? group.permissions?.length ?? "—"} สิทธิ์
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <Pagination
            page={groups.data.page}
            limit={groups.data.limit}
            total={groups.data.total}
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
