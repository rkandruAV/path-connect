import { Router, type Request, type Response, type NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createInvitationSchema } from '../validators/invitations.validator.js';
import * as invitationsService from '../services/invitations.service.js';

export const invitationsRouter = Router();

// Create an invitation (authenticated)
invitationsRouter.post(
  '/',
  authenticate,
  validate({ body: createInvitationSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { invitation, inviteLink } = await invitationsService.createInvitation(
        req.user.id,
        req.body
      );
      res.status(201).json({
        data: { ...invitation, inviteLink },
        message: 'Invitation created',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Validate an invitation token (public — no auth required)
invitationsRouter.get(
  '/:token',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invitation = await invitationsService.getInvitationByToken(req.params.token);
      res.json({
        data: {
          inviteeName: invitation.inviteeName,
          inviteeEmail: invitation.inviteeEmail,
          inviteeRole: invitation.inviteeRole,
          inviter: invitation.inviter,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// Accept an invitation (authenticated — called after registration)
invitationsRouter.post(
  '/:token/accept',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invitation = await invitationsService.acceptInvitation(
        req.params.token,
        req.user.id
      );
      res.json({ data: invitation, message: 'Invitation accepted' });
    } catch (err) {
      next(err);
    }
  }
);

// List sent invitations (authenticated)
invitationsRouter.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invitations = await invitationsService.listInvitations(req.user.id);
      res.json({ data: invitations });
    } catch (err) {
      next(err);
    }
  }
);
