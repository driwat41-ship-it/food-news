import { ReviewList } from "../../../../../features/admin/components/review-list";
import { approveFranchiseOpportunity, rejectFranchiseOpportunity } from "../../../../../features/admin/actions/admin.actions";
import { getReviewQueue } from "../../../../../features/admin/data/admin-loaders";
export default async function Page(){const items=await getReviewQueue("franchiseOpportunities"); return <div><h1 className="mb-5 text-3xl font-black">Franchise Review</h1><ReviewList items={items as any[]} approve={approveFranchiseOpportunity} reject={rejectFranchiseOpportunity}/></div>}
