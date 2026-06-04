import { EmptyState } from "../components/ui/empty-state";
import { ButtonLink } from "../components/ui/button";

export default function NotFound() {
  return <EmptyState title="Page not found" description="The intelligence page you requested does not exist or has moved." action={<ButtonLink href="/">Back to homepage</ButtonLink>} />;
}
