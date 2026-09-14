import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { asyncGetApprovalRequestsActionCreator } from "@/store/approvals/action";
import { getApprovalDetail } from "@/services/api/approvals";
import { getDocumentPreview } from "@/services/api/documents";

export function useApprovalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { approvalRequests } = useAppSelector((state) => state.approvals);

  const [fetchedApproval, setFetchedApproval] = useState<any>(null);
  const [loadingFetched, setLoadingFetched] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  
  // Preview states
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Initial fetch of list
  useEffect(() => {
    dispatch(asyncGetApprovalRequestsActionCreator());
  }, [dispatch]);

  // Derive approval object
  const numericId = Number(id);
  const storedApproval = !isNaN(numericId)
    ? approvalRequests.find((req: any) => req.id === numericId)
    : undefined;

  const approval = storedApproval || fetchedApproval;

  const location = useLocation();
  const isReferenceCheck = location.pathname.includes("/reference/");

  // ... (keep existing lines)

  // Fetch detail if needed
  useEffect(() => {
    if (!id || isNaN(Number(id))) return;
    if (storedApproval || fetchedApproval) return;
    if (loadingFetched || fetchAttempted) return;

    const fetchDetail = async () => {
      setLoadingFetched(true);
      try {
        const type = isReferenceCheck ? "reference" : "document";
        const res = await getApprovalDetail(Number(id), type);
        if (res.success && res.data) {
          setFetchedApproval(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch approval detail:", error);
      } finally {
        setLoadingFetched(false);
        setFetchAttempted(true);
      }
    };
    fetchDetail();
  }, [id, storedApproval, fetchedApproval, loadingFetched, fetchAttempted, isReferenceCheck]);

  // Load preview
  useEffect(() => {
    if (approval?.document?.id) {
      loadPreview(approval.document.id);
    }
  }, [approval?.document?.id]);

  const loadPreview = async (documentId: number) => {
    setPreviewLoading(true);
    setPreviewError(false);
    try {
      const blob = await getDocumentPreview(documentId);
      setPdfBlob(blob);
    } catch (error) {
      console.error("Failed to load preview:", error);
      setPreviewError(true);
    } finally {
      setPreviewLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleBack = () => {
    navigate("/approvals");
  };

  const handleSuccess = () => {
    navigate("/approvals");
  };

  return {
    approval,
    loading: !approval && !fetchAttempted, // Simple loading state
    previewState: {
      loading: previewLoading,
      error: previewError,
      blob: pdfBlob,
      numPages,
      isFullScreen,
    },
    actions: {
      onDocumentLoadSuccess,
      toggleFullScreen,
      handleBack,
      handleSuccess,
      loadPreview
    }
  };
}
