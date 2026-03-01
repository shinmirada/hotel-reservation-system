import { Request, Response } from 'express';
import { RoomService } from '../services/RoomService';

const roomService = new RoomService();

export const getRooms = async (req: Request, res: Response) => {
    try {
        const rooms = await roomService.getAllRooms();
        res.json(rooms);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAvailableRooms = async (req: Request, res: Response) => {
    try {
        const rooms = await roomService.getAvailableRooms();
        res.json(rooms);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getRoom = async (req: Request, res: Response) => {
    try {
        const room = await roomService.getRoomById(parseInt(req.params.id));
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json(room);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createRoom = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        if (data.pricePerNight) {
            data.pricePerNight = parseFloat(data.pricePerNight);
        }
        const room = await roomService.createRoom(data);
        res.status(201).json(room);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateRoom = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        if (data.pricePerNight) {
            data.pricePerNight = parseFloat(data.pricePerNight);
        }
        const room = await roomService.updateRoom(parseInt(req.params.id), data);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json(room);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteRoom = async (req: Request, res: Response) => {
    try {
        const result = await roomService.deleteRoom(parseInt(req.params.id));
        if (!result) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json({ message: 'Room deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const batchUpdateRoomStatus = async (req: Request, res: Response) => {
    try {
        const { roomIds, status } = req.body;
        const results = await roomService.batchUpdateStatus(roomIds, status);
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
