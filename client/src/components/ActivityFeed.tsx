import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageCircle, FileText, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface ActivityFeedProps {
  userId: number;
}

interface Activity {
  id: number;
  activityType: string;
  content: string;
  relatedId?: number;
  createdAt: string;
}

const ActivityFeed = ({ userId }: ActivityFeedProps) => {
  const { data: activities, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/activities`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/activities`);
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json() as Promise<Activity[]>;
    }
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'forum_post': return FileText;
      case 'forum_comment': return MessageCircle;
      case 'appointment': return Calendar;
      case 'profile_update': return User;
      default: return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'forum_post': return 'bg-blue-100 text-blue-600';
      case 'forum_comment': return 'bg-green-100 text-green-600';
      case 'appointment': return 'bg-purple-100 text-purple-600';
      case 'profile_update': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getActivityText = (type: string) => {
    switch (type) {
      case 'forum_post': return 'Post nel forum';
      case 'forum_comment': return 'Commento';
      case 'appointment': return 'Appuntamento';
      case 'profile_update': return 'Aggiornamento profilo';
      default: return 'Attività';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feed Attività</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Feed Attività
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!activities || activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna attività</h3>
            <p className="text-gray-600">Non ci sono ancora attività da mostrare.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.activityType);
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.activityType)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs">
                        {getActivityText(activity.activityType)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(activity.createdAt), 'dd MMM yyyy - HH:mm', { locale: it })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700">{activity.content}</p>
                    
                    {activity.relatedId && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">
                          ID: {activity.relatedId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Sample activities for demo */}
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">
                    Registrazione
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {format(new Date(), 'dd MMM yyyy - HH:mm', { locale: it })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">Account creato con successo</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">
                    Profilo
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {format(new Date(), 'dd MMM yyyy - HH:mm', { locale: it })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">Profilo completato</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;