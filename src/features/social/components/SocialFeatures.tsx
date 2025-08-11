import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { FollowingTab } from "./FollowingTab";
import { ListsTab } from "./ListsTab";

interface SocialFeaturesProps {
  userId?: string;
}

export function SocialFeaturesRefactored({ userId }: SocialFeaturesProps) {
  const [activeTab, setActiveTab] = useState<"following" | "followers" | "lists">("following");
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign in to access social features</h3>
          <p className="text-muted-foreground">
            Connect with other anime and manga enthusiasts
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          Social Features
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="following" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Following
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Followers
            </TabsTrigger>
            <TabsTrigger value="lists" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Lists
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="following">
              <FollowingTab />
            </TabsContent>

            <TabsContent value="followers">
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Followers</h3>
                <p className="text-muted-foreground">
                  Your followers will appear here
                </p>
              </div>
            </TabsContent>

            <TabsContent value="lists">
              <ListsTab />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}