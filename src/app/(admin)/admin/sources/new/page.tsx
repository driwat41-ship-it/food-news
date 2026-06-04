import { SourceForm } from "../../../../../features/admin/components/entity-forms"; import { createSource } from "../../../../../features/admin/actions/admin.actions";
export default function Page(){return <div><h1 className="mb-5 text-3xl font-black">Add RSS Source</h1><SourceForm action={createSource}/></div>}
