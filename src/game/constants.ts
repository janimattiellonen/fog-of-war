export const PLAYER_RADIUS = 12.5;
export const PLAYER_DIAMETER = 25;
export const VISIBLE_RADIUS = 600;
export const VISIBLE_DIAMETER = 500;
export const FOG_EDGE_THICKNESS = 15;
export const MOVE_SPEED = 3;
export const DEFAULT_MAX_HP = 20;

/** Flashlight beam full angle in degrees. The cone extends half this angle on each side of the facing direction. */
export const FLASHLIGHT_BEAM_ANGLE_DEG = 45;
export const FLASHLIGHT_BEAM_ANGLE = (FLASHLIGHT_BEAM_ANGLE_DEG * Math.PI) / 180;

/** How fast the flashlight sweeps toward the target direction, in radians per second. */
export const FLASHLIGHT_TURN_SPEED = 4;

/** Radius of the always-on visibility disk around the player in flashlight mode. */
export const AMBIENT_RADIUS = 25;
