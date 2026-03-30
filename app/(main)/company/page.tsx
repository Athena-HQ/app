"use client";

import { motion } from "framer-motion";
import { fadeInVariants } from "@/lib/animations-settings";
import { useCompanyOrgData } from "@/hooks/useCompanyOrgData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, Users, Globe, Phone, MapPin, Hash, CalendarDays, ShieldCheck
} from "lucide-react";

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse w-full">
      <div className="h-10 w-48 rounded bg-muted" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 rounded-lg border bg-muted/50" />
        ))}
      </div>
    </div>
  );
}

export default function CompanyPage() {
  const { company, employees, isLoading, isError } = useCompanyOrgData();

  if (isLoading) {
    return (
      <div className="w-full">
        <LoadingSkeleton />
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[280px] text-center px-4">
        <p className="text-muted-foreground">
          You don't have access to company details or your org isn't set up yet.
        </p>
      </div>
    );
  }

  // Attempt to safely extract manager info
  const managerObj = company.company_manager || employees.find(e => e.role?.toLowerCase() === "company manager");
  const establishedDate = company.created_at ? new Date(company.created_at).toLocaleDateString() : "Unknown";

  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-8 w-full pb-8 max-w-6xl"
    >
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight">{company.name}</h1>
        </div>
        <p className="text-sm uppercase tracking-widest text-muted-foreground font-medium ml-1">
          Company Overview & Details
        </p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Manager Card */}
        <Card className="bg-primary/5 shadow-sm border-primary/20 hover:border-primary/40 transition-colors md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Company Manager
            </CardTitle>
          </CardHeader>
          <CardContent>
            {managerObj ? (
              <div className="flex items-center gap-4 mt-1">
                <Avatar className="h-14 w-14 border-2 border-primary/20 bg-background shadow-sm">
                  <AvatarFallback className="text-lg font-semibold text-primary">
                    {(managerObj.first_name?.[0] || managerObj.email?.[0] || "?").toUpperCase()}{(managerObj.last_name?.[0] || "").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <p className="font-serif text-xl leading-none font-medium truncate">
                    {`${managerObj.first_name || ""} ${managerObj.last_name || ""}`.trim() || "Manager"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {managerObj.email}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-lg font-medium text-muted-foreground py-2">No manager assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Identifier Card */}
        <Card className="bg-card shadow-sm border-border/60 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <Hash className="w-4 h-4" /> Company ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-mono font-semibold tracking-wider">
              {company.identifier || "N/A"}
            </p>
          </CardContent>
        </Card>

        {/* Size Card */}
        <Card className="bg-card shadow-sm border-border/60 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <Users className="w-4 h-4" /> Company Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold leading-tight">
              {company.company_size || "Not specified"}
            </p>
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card className="bg-card shadow-sm border-border/60 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {company.city || company.country ? (
              <div className="flex flex-col gap-1">
                <p className="text-lg font-semibold leading-tight">
                  {company.city}{company.city && company.country ? ", " : ""}{company.country}
                </p>
                {company.postal_code && (
                  <p className="text-sm text-muted-foreground font-mono">
                    Zip: {company.postal_code}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xl font-semibold text-muted-foreground">Location not provided</p>
            )}
          </CardContent>
        </Card>

        {/* Domain & Contact Card */}
        <Card className="bg-card shadow-sm border-border/60 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <Globe className="w-4 h-4" /> Web & Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-foreground">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium truncate">{company.domain ? `www.${company.domain}` : "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium font-mono truncate">{company.phone_number || "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Established Card */}
        <Card className="bg-card shadow-sm border-border/60 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Established
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">
              {establishedDate}
            </p>
          </CardContent>
        </Card>

      </div>
    </motion.div>
  );
}
