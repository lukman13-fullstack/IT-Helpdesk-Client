import Layout from "@/components/layout/layout";
import { useAppSelector } from "@/hooks/useAppSelector";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ChangePasswordModal from "./components/ChangePasswordModal";
import { useLanguage } from "@/context/LanguageContext";

export default function Profile() {
  const { t } = useLanguage();
  const authUser = useAppSelector((state) => state.authUser.user);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  return (
    <Layout title={t("profile.profile")} items={[{ label: t("common.home"), href: "/" }]}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="custom-scrollbar">
          <CardHeader className="flex flex-col gap-2 items-center justify-between border-b pb-2">
            <div className="flex items-center justify-center">
              <Avatar className="w-24 h-24">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AN</AvatarFallback>
              </Avatar>
            </div>

            <CardTitle className="text-center">{authUser?.fullName}</CardTitle>
            <div className="flex items-center justify-center w-full mt-10">
              <Button onClick={() => setIsChangePasswordModalOpen(true)}>
                {t("profile.changePassword")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableHead className="w-[150px]">{t("profile.name")}</TableHead>
                  <TableCell>{authUser?.fullName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>{t("profile.username")}</TableHead>
                  <TableCell>{authUser?.username}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>{t("profile.email")}</TableHead>
                  <TableCell>{authUser?.email}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>{t("profile.role")}</TableHead>
                  <TableCell>{authUser?.role.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>{t("profile.department")}</TableHead>
                  <TableCell>{authUser?.departments?.join(", ")}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
      <ChangePasswordModal
        open={isChangePasswordModalOpen}
        onOpenChange={setIsChangePasswordModalOpen}
      />
    </Layout>
  );
}
