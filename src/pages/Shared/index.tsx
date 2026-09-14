import Layout from "@/components/layout/layout";
import DepartmentList from "./components/department-list";
import { useLanguage } from "@/context/LanguageContext";

export default function Shared() {
  const { t } = useLanguage();
  return (
    <Layout title={t("sidebar.sharedDocuments")} items={[{ label: t("common.home"), href: "/" }]}>
      <DepartmentList />
    </Layout>
  );
}
