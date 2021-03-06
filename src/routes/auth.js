import passport from 'koa-passport';
import argon2 from 'argon2';
const router = require('koa-router')();
import { isAuthenticated } from '../auth';

router.post('/api/login', async (ctx, _next) => {
  return passport.authenticate('local', (err, user, info, status) => {
    if (user === false) {
      ctx.body = { success: false };
      ctx.throw(401);
    } else {
      ctx.body = { user };
      return ctx.login(user);
    }
  })(ctx, _next);
});

router.get('/api/logout', async (ctx, _next) => {
  ctx.logout();
  ctx.status = 200;
})

router.get('/api/get-account', isAuthenticated, async (ctx, _next) => {
  ctx.body = ctx.state.user;
  ctx.status = 200;
});

module.exports = router;
