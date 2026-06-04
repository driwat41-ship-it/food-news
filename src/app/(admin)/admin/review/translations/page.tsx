import { ReviewList } from "../../../../../features/admin/components/review-list";
import { approveTranslation, rejectTranslation } from "../../../../../features/admin/actions/admin.actions";
import { getReviewQueue } from "../../../../../features/admin/data/admin-loaders";
export default async function Page(){const items=await getReviewQueue("translations"); return <div><h1 className="mb-5 text-3xl font-black">Translation Review</h1><ReviewList items={items as any[]} approve={approveTranslation} reject={rejectTranslation}/></div>}
