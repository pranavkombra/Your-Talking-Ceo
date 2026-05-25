/**
 * Room connection debugger hook
 * Monitors and logs room connection state for troubleshooting
 */

import { useEffect, useRef } from 'react';
import { useSessionContext } from '@livekit/components-react';
import { toast } from 'sonner';

export function useRoomConnectionDebug() {
  const context = useSessionContext();
  const { room, isConnected, isConnecting, connectionState } = context || {};
  const debugLogRef = useRef<string[]>([]);

  useEffect(() => {
    const log = (msg: string) => {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] ${msg}`;
      debugLogRef.current.push(logEntry);
      console.log('[RoomDebug]', logEntry);
    };

    // Log connection state changes
    if (isConnecting) {
      log('🔄 Connecting to room...');
    }

    if (isConnected && room) {
      log(`✅ Connected to room: ${room?.name || 'unknown'}`);
      const participantsCount = room?.participants?.size ?? 0;
      const remoteParticipantsCount = room?.remoteParticipants?.size ?? 0;
      log(`📊 Room state: participants=${participantsCount}, remote=${remoteParticipantsCount}`);

      // Check microphone
      const audioTracks = room?.localParticipant?.audioTracks;
      if (audioTracks && audioTracks.size > 0) {
        log(`🎤 Audio track published: ${audioTracks.size} track(s)`);
        audioTracks.forEach((track) => {
          log(`  - Track: ${track.sid}, enabled: ${track.track?.enabled}`);
        });
      } else {
        log('⚠️ No audio track published to room');
      }

      // List all participants
      const participants = room?.participants;
      if (participants && participants.size > 0) {
        log(`👥 Participants in room:`);
        participants.forEach((participant) => {
          const audioTracksCount = participant.audioTracks?.size ?? 0;
          const videoTracksCount = participant.videoTracks?.size ?? 0;
          log(`  - ${participant.identity}: audio=${audioTracksCount}, video=${videoTracksCount}`);
        });
      } else {
        log('❌ No other participants in room (agent may not be connected)');
      }
    }

    if (!isConnected && !isConnecting && room) {
      log(`❌ Disconnected from room: ${room?.name || 'unknown'}`);
    }
  }, [isConnected, isConnecting, room]);

  // Monitor room events
  useEffect(() => {
    if (!room) return;

    const onParticipantConnected = (participant: any) => {
      console.log('[RoomEvent] Participant connected:', participant.identity);
    };

    const onParticipantDisconnected = (participant: any) => {
      console.log('[RoomEvent] Participant disconnected:', participant.identity);
    };

    const onError = (error: Error) => {
      console.error('[RoomEvent] Error:', error);
      toast.error(`Room error: ${error.message}`);
    };

    room.on('participantConnected', onParticipantConnected);
    room.on('participantDisconnected', onParticipantDisconnected);
    room.on('error', onError);

    return () => {
      room.off('participantConnected', onParticipantConnected);
      room.off('participantDisconnected', onParticipantDisconnected);
      room.off('error', onError);
    };
  }, [room]);

  return {
    getLogs: () => debugLogRef.current.join('\n'),
  };
}
