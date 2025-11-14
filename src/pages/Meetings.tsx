import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockMeetings, Meeting } from "@/data/mockMeetings";
import { Badge } from "@/components/ui/badge";

export default function Meetings() {
  const [meetings, setMeetings] = useState(mockMeetings);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const handleTypeChange = (id: string, type: Meeting["type"]) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, type } : m))
    );
  };

  const handleViewDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
  };

  return (
    <AppLayout pageTitle="Meetings">
      <div className="space-y-6">
        {/* Meetings Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Fireflies Transcripts</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Meeting Type</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell className="font-medium">{meeting.title}</TableCell>
                  <TableCell>{meeting.date}</TableCell>
                  <TableCell>
                    <Select
                      value={meeting.type}
                      onValueChange={(value) =>
                        handleTypeChange(meeting.id, value as Meeting["type"])
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sprint Planning">
                          Sprint Planning
                        </SelectItem>
                        <SelectItem value="PBR">PBR</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(meeting)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Meeting Details Panel */}
        {selectedMeeting && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedMeeting.title}</h3>
              <Badge variant="outline">{selectedMeeting.type}</Badge>
            </div>

            {/* Summary */}
            {selectedMeeting.summary && (
              <div className="mb-6 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                    Overview
                  </h4>
                  <p className="text-sm">{selectedMeeting.summary.overview}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                    Action Items
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedMeeting.summary.action_items.map((item, idx) => (
                      <li key={idx} className="text-sm">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Transcript */}
            {selectedMeeting.transcript && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                  Transcript
                </h4>
                <div className="space-y-4 max-h-96 overflow-y-auto bg-muted/30 p-4 rounded-lg">
                  {selectedMeeting.transcript.map((entry, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-primary">
                          {entry.speaker}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {entry.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{entry.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
