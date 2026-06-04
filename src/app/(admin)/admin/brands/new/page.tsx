import { BrandForm } from "../../../../../features/admin/components/entity-forms"; import { createBrand } from "../../../../../features/admin/actions/admin.actions";
export default function Page(){return <div><h1 className="mb-5 text-3xl font-black">New Brand</h1><BrandForm action={createBrand}/></div>}
