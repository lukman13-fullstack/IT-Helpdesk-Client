import DocumentSharedList from "@/pages/Shared/components/DocumentSharedList";
import Layout from "@/components/layout/layout";
import { useLanguage } from "@/context/LanguageContext";

export default function DocumentsShared() {
  const { t } = useLanguage();
  return (
    <Layout
      title={t("sidebar.sharedDocuments")}
      items={[{ label: t("sidebar.sharedDocuments"), href: "/shared-documents" }]}
    >
      <DocumentSharedList />
    </Layout>
  );
}
