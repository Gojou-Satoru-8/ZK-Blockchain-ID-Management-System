"use client";

import * as React from "react";

import { cn } from "@components/lib/utils";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Button } from "@components/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@components/components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/components/ui/table";

type DrawerDialogDemo = {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  description?: string;
  buttonText?: string;
  // buttonOnClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  mainContent: React.ReactNode;
};

export function DrawerDialogDemo({
  open,
  setOpen,
  title,
  description,
  mainContent,
}: // buttonOnClick,
DrawerDialogDemo) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {/* <DialogTrigger asChild>
          <Button
            size={"lg"}
            className="cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground"
            onClick={buttonOnClick}
          >
            {buttonText}
          </Button>
        </DialogTrigger> */}
        <DialogContent className="w-full">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {/* <ProfileForm /> */}
          {mainContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {/* <DrawerTrigger asChild>
        <Button
          size="lg"
          className="cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground"
          onClick={buttonOnClick}
        >
          {buttonText}
        </Button>
      </DrawerTrigger> */}
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        {/* <ProfileForm className="px-4" /> */}
        {mainContent}
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

type IssuerTableProps = {
  columns: claimsArrayType | [];
  data: credentialsObjectType;
};
export const IssuerTable: React.FC<IssuerTableProps> = ({ columns, data }) => {
  return (
    <Table className="border max-w-full">
      <TableHeader>
        <TableRow>
          <TableHead colSpan={columns.length} className="text-center text-xl">
            Credentials List
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead className="w-1/3">Field</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {columns?.length ? (
          columns.map((field, index) => (
            <TableRow key={field}>
              <TableHead>
                {" "}
                {field === "id"
                  ? "ID"
                  : field === "ethAddress"
                  ? "Ethereum Address"
                  : field.at(0)?.toUpperCase() + field.slice(1)}
              </TableHead>
              <TableCell align="left" className="max-w-[100px] overflow-auto">
                {data?.[field] ? data?.[field] : "N/A"}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              Nothing to show
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
