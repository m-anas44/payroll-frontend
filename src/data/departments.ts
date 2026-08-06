import { Department } from "@/types/department";

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: "dept-1",
    code: "CUT-01",
    name: "Cutting Department",
    description: "Leather and synthetic fabric laser/hand cutting operations.",
    status: "Active",
    workerCount: 12,
    createdAt: "2026-01-10",
  },
  {
    id: "dept-2",
    code: "STITCH-02",
    name: "Stitching Department",
    description: "Upper stitching, machine embroidery, and edging.",
    status: "Active",
    workerCount: 28,
    createdAt: "2026-01-10",
  },
  {
    id: "dept-3",
    code: "SOLE-03",
    name: "Sole & Bottom Department",
    description: "Sole moulding, cementing, trimming, and heel attaching.",
    status: "Active",
    workerCount: 15,
    createdAt: "2026-01-12",
  },
  {
    id: "dept-4",
    code: "FINISH-04",
    name: "Finishing & Packing",
    description: "Lace threading, polishing, quality check, and boxing.",
    status: "Active",
    workerCount: 10,
    createdAt: "2026-01-15",
  },
];
