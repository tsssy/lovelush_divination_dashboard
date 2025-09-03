import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface User {
  id: string;
  user_id: string;
  user_name: string;
  user_age: number;
  user_location: string;
  user_occupation: string;
  user_tags: string[];
  user_photo_url: string[];
}

interface UserPreviewProps {
  user: User;
  onClose: () => void;
}

export function UserPreview({ user, onClose }: UserPreviewProps) {

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Preview: {user.user_name}</CardTitle>
          <Button 
            size="sm" 
            variant="outline"
            onClick={onClose}
          >
            <span className="text-base">❌</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="match" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="match">New Match Card</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="match" className="mt-4">
            <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              <p>New Match Card component will be rendered here</p>
              <p className="text-xs mt-2">This will use the actual app's match card component</p>
            </div>
          </TabsContent>
          
          <TabsContent value="chat" className="mt-4">
            <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              <p>Chat component will be rendered here</p>
              <p className="text-xs mt-2">This will use the actual app's chat interface component</p>
            </div>
          </TabsContent>
          
          <TabsContent value="profile" className="mt-4">
            <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              <p>Profile component will be rendered here</p>
              <p className="text-xs mt-2">This will use the actual app's profile view component</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}