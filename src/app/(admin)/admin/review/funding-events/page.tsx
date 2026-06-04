import { ReviewList } from "../../../../../features/admin/components/review-list";
import { approveFundingEvent, rejectFundingEvent } from "../../../../../features/admin/actions/admin.actions";
import { getReviewQueue } from "../../../../../features/admin/data/admin-loaders";
export default async function Page(){const items=await getReviewQueue("fundingEvents"); return <div><h1 className="mb-5 text-3xl font-black">Funding Event Review</h1><ReviewList items={items as any[]} approve={approveFundingEvent} reject={rejectFundingEvent}/></div>}
