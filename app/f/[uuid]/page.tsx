import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Download File | Toolsahayata File Sharing",
  description: "Download shared file securely from Toolsahayata.",
};

export default async function Page(props: { params: Promise<{ uuid: string }> }) {
  const params = await props.params;
  return <ToolContent params={params} />;
}
