import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TransactionEventsTypesEnum } from '../transaction/enum/transaction-events-types.enum';

@WebSocketGateway({
    cors: {
        origin: true,
        credentials: true,
    },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    private clients: Map<string, Socket> = new Map();

    handleConnection(client: Socket) {
        let userId = client.handshake.query.userId as string;
        if (!userId) {
            this.disconnectInvalidClient(client);
            return;
        }
        userId = userId.toString();
        this.clients.set(userId, client);
    }

    handleDisconnect(client: Socket) {
        const userId = client.handshake.query.userId as string;
        if (userId) {
            this.clients.delete(userId.toString());
        }
    }

    sendEventToUser(userId: number, data: any, eventName: TransactionEventsTypesEnum) {
        const client = this.clients.get(userId.toString());
        if (client) {
            client.emit(eventName, data);
        }
    }

    private disconnectInvalidClient(client: Socket) {
        client.disconnect();
    }
}
