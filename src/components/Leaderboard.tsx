import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  score: number;
  accuracy: number | null;
  created_at: string;
  username?: string;
}

interface LeaderboardProps {
  gameType: string;
  title?: string;
  limit?: number;
}

export const Leaderboard = ({ gameType, title = 'Leaderboard', limit = 10 }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data: scores, error } = await supabase
        .from('game_scores')
        .select('*')
        .eq('game_type', gameType)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }

      // Fetch usernames for each score
      const userIds = [...new Set(scores?.map(s => s.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.username]) || []);

      const entriesWithNames = scores?.map(score => ({
        ...score,
        username: profileMap.get(score.user_id) || 'Anonymous'
      })) || [];

      setEntries(entriesWithNames);
      setLoading(false);
    };

    fetchLeaderboard();
  }, [gameType, limit]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-muted-foreground text-sm">{index + 1}</span>;
    }
  };

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No scores yet. Be the first!</p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                  index < 3 ? 'bg-primary/10' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getRankIcon(index)}
                  <span className="font-medium truncate max-w-[120px]">{entry.username}</span>
                </div>
                <div className="flex items-center gap-4">
                  {entry.accuracy !== null && (
                    <span className="text-sm text-muted-foreground">{entry.accuracy}%</span>
                  )}
                  <span className="font-bold text-primary">{entry.score.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
