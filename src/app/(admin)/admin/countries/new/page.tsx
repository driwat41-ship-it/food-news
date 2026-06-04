import { CountryForm } from "../../../../../features/admin/components/entity-forms"; import { createCountry } from "../../../../../features/admin/actions/admin.actions";
export default function Page(){return <div><h1 className="mb-5 text-3xl font-black">New Country</h1><CountryForm action={createCountry}/></div>}
