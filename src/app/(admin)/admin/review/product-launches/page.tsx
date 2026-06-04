import { ReviewList } from "../../../../../features/admin/components/review-list";
import { approveProductLaunch, rejectProductLaunch } from "../../../../../features/admin/actions/admin.actions";
import { getReviewQueue } from "../../../../../features/admin/data/admin-loaders";
export default async function Page(){const items=await getReviewQueue("productLaunches"); return <div><h1 className="mb-5 text-3xl font-black">Product Launch Review</h1><ReviewList items={items as any[]} approve={approveProductLaunch} reject={rejectProductLaunch}/></div>}
