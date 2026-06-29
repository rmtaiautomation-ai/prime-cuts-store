"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function CustomersPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      // DEBUG: Check if we actually have a session
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Current Supabase Session:", sessionData.session);

      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      
      if (error) {
        console.error("Supabase Error fetching profiles:", error);
      } else {
        console.log("Fetched profiles:", data);
      }
      
      if (data) setProfiles(data);
      setIsLoading(false);
    }
    fetchProfiles();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Customers</h1>
        <p className="text-muted-foreground mt-1">View your registered customers and their details.</p>
      </div>
      
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Shipping Address</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Loading customers...
                </TableCell>
              </TableRow>
            ) : profiles && profiles.length > 0 ? (
              profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.full_name || "N/A"}</TableCell>
                  <TableCell>{profile.phone || "N/A"}</TableCell>
                  <TableCell>{profile.shipping_address || "N/A"}</TableCell>
                  <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {profile.is_admin ? (
                      <Badge variant="default">Admin</Badge>
                    ) : (
                      <Badge variant="secondary">Customer</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
