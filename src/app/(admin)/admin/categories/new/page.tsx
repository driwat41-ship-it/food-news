import { CategoryForm } from "../../../../../features/admin/components/entity-forms"; import { createCategory } from "../../../../../features/admin/actions/admin.actions";
export default function Page(){return <div><h1 className="mb-5 text-3xl font-black">New Category</h1><CategoryForm action={createCategory}/></div>}
