import { Request, Response } from 'express';
import { GuestService } from '../services/GuestService';

const guestService = new GuestService();

export const getGuests = async (req: Request, res: Response) => {
    try {
        const guests = await guestService.getAllGuests();
        res.json(guests);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getGuest = async (req: Request, res: Response) => {
    try {
        const guest = await guestService.getGuestById(parseInt(req.params.id));
        if (!guest) {
            return res.status(404).json({ message: 'Guest not found' });
        }
        res.json(guest);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createGuest = async (req: Request, res: Response) => {
    try {
        const guest = await guestService.createGuest(req.body);
        res.status(201).json(guest);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateGuest = async (req: Request, res: Response) => {
    try {
        const guest = await guestService.updateGuest(parseInt(req.params.id), req.body);
        if (!guest) {
            return res.status(404).json({ message: 'Guest not found' });
        }
        res.json(guest);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteGuest = async (req: Request, res: Response) => {
    try {
        const result = await guestService.deleteGuest(parseInt(req.params.id));
        if (!result) {
            return res.status(404).json({ message: 'Guest not found' });
        }
        res.json({ message: 'Guest deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
