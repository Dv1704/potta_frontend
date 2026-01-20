/**
 * Game engine constants
 * Ported from game_engine settings.js
 */

// Canvas dimensions (reference size, scaled dynamically)
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 770;

// FPS target
export const FPS = 60;
export const FPS_TIME = 1000 / FPS;

// Edge board offsets
export const EDGEBOARD_X = 126;
export const EDGEBOARD_Y = 100;

// Ball physics
export const BALL_DIAMETER = 28; // Original engine value for proper spacing
export const BALL_RADIUS = BALL_DIAMETER / 2;
export const BALL_DIAMETER_SQUARED = BALL_DIAMETER * BALL_DIAMETER;
export const BALL_RADIUS_SQUARED = BALL_RADIUS * BALL_RADIUS;
export const BALL_3D_DIAMETER = BALL_DIAMETER;
export const BALL_Z_POSITION = 17; // Half of diameter to sit on table

// Physics constants
export const K_FRICTION = 0.985;           // Friction per frame
export const K_IMPACT_BALL = 0.98;          // Slightly more elastic
export const K_IMPACT_BANK = 0.8;          // Energy loss on cushion hit
export const K_MIN_FORCE = 0.01;           // Smoother stop threshold (force squared)
export const MAX_POWER_SHOT = 200;          // Maximum shot power
export const MIN_POWER_SHOT = 10;           // Minimum shot power
export const MAX_POWER_FORCE_BALL = 45;     // Maximum force applied to ball
export const DAMPING_BALL_EFFECT = 0.9;     // Spin effect damping

// Spin effects
export const MAX_SPIN_VALUE = 50;
export const MAX_BACK_SPIN_CUE_FORCE = 12;  // Increased for "pro" feel (stop/draw shots)

// Pocket detection
export const POOL_HOLE_RADIUS = 30;
export const DIST_BALL_HOLE = 66;

// Table boundary rectangle (playable area)
export const RECT_COLLISION = {
    x: 124,
    y: 117,
    width: 1037,
    height: 483,
    right: 124 + 1037,
    bottom: 117 + 483
};

// Table center (calculated from collision rect)
export const TABLE_CENTER = {
    x: RECT_COLLISION.x + RECT_COLLISION.width / 2,  // 642.5
    y: RECT_COLLISION.y + RECT_COLLISION.height / 2  // 358.5
};

// Cue ball starting position
export const CUE_BALL_POS = { x: 357, y: 356 };
export const CUE_BALL_RESPOT_1 = { x: 109, y: 102 };
export const CUE_BALL_RESPOT_3 = { x: 1168, y: 616 };

// Pocket center positions (6 pockets)
export const HOLE_CENTER_POS = [
    { x: 95, y: 85, id: 0 },   // Top-left
    { x: 640, y: 72, id: 1 },   // Top-center
    { x: 1185, y: 88, id: 2 },   // Top-right
    { x: 1185, y: 628, id: 3 },   // Bottom-right
    { x: 640, y: 639, id: 4 },   // Bottom-center
    { x: 95, y: 628, id: 5 }    // Bottom-left
];

// CPU AI targets (slightly inside pockets)
export const HOLE_CPU_POINTS = [
    { x: 105, y: 97 },
    { x: 640, y: 80 },
    { x: 1173, y: 97 },
    { x: 1173, y: 613 },
    { x: 640, y: 632 },
    { x: 105, y: 613 }
];

// Table edge boundary points (24 points defining the playable area)
export const FIELD_POINTS = [
    { x: 88, y: 46 },   // 0
    { x: 130, y: 81 },   // 1
    { x: 607, y: 81 },   // 2
    { x: 620, y: 32 },   // 3
    { x: 659, y: 32 },   // 4
    { x: 673, y: 81 },   // 5
    { x: 1150, y: 81 },   // 6
    { x: 1193, y: 44 },   // 7
    { x: 1226, y: 77 },   // 8
    { x: 1189, y: 121 },  // 9
    { x: 1189, y: 591 },  // 10
    { x: 1226, y: 636 },  // 11
    { x: 1193, y: 667 },  // 12
    { x: 1150, y: 631 },  // 13
    { x: 673, y: 631 },  // 14
    { x: 658, y: 679 },  // 15
    { x: 622, y: 679 },  // 16
    { x: 607, y: 631 },  // 17
    { x: 130, y: 631 },  // 18
    { x: 86, y: 665 },  // 19
    { x: 55, y: 635 },  // 20
    { x: 91, y: 592 },  // 21
    { x: 91, y: 114 },  // 22
    { x: 53, y: 74 }    // 23
];

// Main table edges (for collision detection optimization)
export const MAIN_TABLE_EDGE = [1, 5, 9, 13, 17, 21];

// 8-Ball rack starting positions (15 balls)
// Positioned to align with the "8 Ball Pro" watermark on the table
const RACK_CENTER_Y = 358;  // Vertical center
const RACK_START_X = 520;   // Aligned with watermark center (moved right)
const ROW_SPACING = 25;     // sqrt(3) * BALL_RADIUS ≈ 24.25
const BALL_SPACING = 14;    // BALL_RADIUS

export const RACK_POS_8BALL = [
    // Row 1 (apex) - 2 rows back from center
    { x: RACK_START_X - (ROW_SPACING * 2), y: RACK_CENTER_Y },

    // Row 2 - 1 row back from center  
    { x: RACK_START_X - ROW_SPACING, y: RACK_CENTER_Y - BALL_SPACING },
    { x: RACK_START_X - ROW_SPACING, y: RACK_CENTER_Y + BALL_SPACING },

    // Row 3 (at center) - this row is at exact table center
    { x: RACK_START_X, y: RACK_CENTER_Y - (BALL_SPACING * 2) },
    { x: RACK_START_X, y: RACK_CENTER_Y },  // 8-ball at dead center
    { x: RACK_START_X, y: RACK_CENTER_Y + (BALL_SPACING * 2) },

    // Row 4 - 1 row forward from center
    { x: RACK_START_X + ROW_SPACING, y: RACK_CENTER_Y - (BALL_SPACING * 3) },
    { x: RACK_START_X + ROW_SPACING, y: RACK_CENTER_Y - BALL_SPACING },
    { x: RACK_START_X + ROW_SPACING, y: RACK_CENTER_Y + BALL_SPACING },
    { x: RACK_START_X + ROW_SPACING, y: RACK_CENTER_Y + (BALL_SPACING * 3) },

    // Row 5 (back) - 2 rows forward from center
    { x: RACK_START_X + (ROW_SPACING * 2), y: RACK_CENTER_Y - (BALL_SPACING * 4) },
    { x: RACK_START_X + (ROW_SPACING * 2), y: RACK_CENTER_Y - (BALL_SPACING * 2) },
    { x: RACK_START_X + (ROW_SPACING * 2), y: RACK_CENTER_Y },
    { x: RACK_START_X + (ROW_SPACING * 2), y: RACK_CENTER_Y + (BALL_SPACING * 2) },
    { x: RACK_START_X + (ROW_SPACING * 2), y: RACK_CENTER_Y + (BALL_SPACING * 4) }
];
// 9-Ball rack starting positions
export const RACK_POS_9BALL = [
    { x: 916, y: 356 },
    { x: 949, y: 376 },
    { x: 949, y: 335 },
    { x: 982, y: 396 },
    { x: 982, y: 356 },
    { x: 982, y: 316 },
    { x: 1015, y: 376 },
    { x: 1015, y: 335 },
    { x: 1048, y: 356 }
];

// Table bumper positions (for 3D rendering)
export const TABLE_UPPER_BUMPER = [
    { x: 366, y: 63, sprite: 'bumper_top_left', regX: 2, regY: 0 },
    { x: 915, y: 63, sprite: 'bumper_top_right', regX: 2, regY: 0 },
    { x: 1206, y: 356, sprite: 'bumper_right', regX: 1, regY: 2 },
    { x: 915, y: 649, sprite: 'bumper_bottom_right', regX: 2, regY: 1 },
    { x: 366, y: 649, sprite: 'bumper_bottom_left', regX: 2, regY: 1 },
    { x: 74, y: 356, sprite: 'bumper_left', regX: 0, regY: 2 }
];

// Ball rail exit position (where potted balls appear)
export const POS_RAIL_EXIT = { x: 250, y: 742 };

// Shot animation timing
export const TIME_ANIMATION_SHOT_ELASTIC = 1500;
export const TIME_ANIMATION_SHOT_BACK = 300;

// Game states
export const STATE_LOADING = 0;
export const STATE_MENU = 1;
export const STATE_GAME = 2;

// Table states
export const STATE_TABLE_PLACE_CUE_BALL_BREAKSHOT = 0;
export const STATE_TABLE_PLACE_CUE_BALL = 1;
export const STATE_TABLE_MOVE_STICK = 2;
export const STATE_TABLE_SHOOT = 3;
export const STATE_TABLE_SHOOTING = 4;

// Game modes
export const GAME_MODE_EIGHT = 0;
export const GAME_MODE_NINE = 1;
export const GAME_MODE_TIME = 2;

// Player modes
export const GAME_MODE_CPU = 0;
export const GAME_MODE_TWO = 1;

// Event types
export const ON_BALL_INTO_HOLE = 'ballInHole';
export const ON_BALL_WITH_BALL = 'ballWithBall';
export const ON_BALL_WITH_BANK = 'ballWithBank';
export const ON_BALLS_STOPPED = 'ballsStopped';
export const ON_SHOT_TAKEN = 'shotTaken';
export const ON_TURN_CHANGE = 'turnChange';
export const ON_GAME_OVER = 'gameOver';

// Trajectory colors for aim line
export const PREVISION_TRAJECTORY_COLORS = [
    ['#fff', '#f00'],
    ['#00f', '#f00']
];

// Ball texture paths
export const TEXTURE_PATHS = [
    { path: '/assets/all_sprites/textures/ball_0.jpg', name: 'cue_ball' },
    { path: '/assets/all_sprites/textures/ball_1.jpg', name: 'ball_1' },
    { path: '/assets/all_sprites/textures/ball_2.jpg', name: 'ball_2' },
    { path: '/assets/all_sprites/textures/ball_3.jpg', name: 'ball_3' },
    { path: '/assets/all_sprites/textures/ball_4.jpg', name: 'ball_4' },
    { path: '/assets/all_sprites/textures/ball_5.jpg', name: 'ball_5' },
    { path: '/assets/all_sprites/textures/ball_6.jpg', name: 'ball_6' },
    { path: '/assets/all_sprites/textures/ball_7.jpg', name: 'ball_7' },
    { path: '/assets/all_sprites/textures/ball_8.jpg', name: 'ball_8' },
    { path: '/assets/all_sprites/textures/ball_9.jpg', name: 'ball_9' },
    { path: '/assets/all_sprites/textures/ball_10.jpg', name: 'ball_10' },
    { path: '/assets/all_sprites/textures/ball_11.jpg', name: 'ball_11' },
    { path: '/assets/all_sprites/textures/ball_12.jpg', name: 'ball_12' },
    { path: '/assets/all_sprites/textures/ball_13.jpg', name: 'ball_13' },
    { path: '/assets/all_sprites/textures/ball_14.jpg', name: 'ball_14' },
    { path: '/assets/all_sprites/textures/ball_15.jpg', name: 'ball_15' }
];

export default {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    FPS,
    BALL_DIAMETER,
    BALL_RADIUS,
    K_FRICTION,
    K_IMPACT_BALL,
    K_MIN_FORCE,
    MAX_POWER_SHOT,
    POOL_HOLE_RADIUS,
    RECT_COLLISION,
    TABLE_CENTER,
    HOLE_CENTER_POS,
    FIELD_POINTS,
    RACK_POS_8BALL,
    CUE_BALL_POS
};
