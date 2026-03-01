import { Request, Response } from 'express';
import { ReservationService } from '../services/ReservationService';

const reservationService = new ReservationService();

export const getReservations = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        let reservations;
        if (status) {
            reservations = await reservationService.getReservationsByStatus(status as string);
        } else {
            reservations = await reservationService.getAllReservations();
        }
        res.json(reservations);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getReservation = async (req: Request, res: Response) => {
    try {
        const reservation = await reservationService.getReservationById(parseInt(req.params.id));
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        res.json(reservation);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createReservation = async (req: Request, res: Response) => {
    try {
        const reservation = await reservationService.createReservation(req.body);
        res.status(201).json(reservation);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateReservation = async (req: Request, res: Response) => {
    try {
        const reservation = await reservationService.updateReservation(parseInt(req.params.id), req.body);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        res.json(reservation);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteReservation = async (req: Request, res: Response) => {
    try {
        const result = await reservationService.deleteReservation(parseInt(req.params.id));
        if (!result) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        res.json({ message: 'Reservation deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const batchCheckIn = async (req: Request, res: Response) => {
    try {
        const { reservationIds } = req.body;
        const results = await reservationService.batchCheckIn(reservationIds);
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const batchCheckOut = async (req: Request, res: Response) => {
    try {
        const { reservationIds } = req.body;
        const results = await reservationService.batchCheckOut(reservationIds);
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
