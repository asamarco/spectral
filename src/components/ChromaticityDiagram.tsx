import React from 'react';
import { ResponsiveContainer, ScatterChart, XAxis, YAxis, CartesianGrid, Scatter, Cell, Line, LineChart, Text, ReferenceLine } from 'recharts';

interface ChromaticityDiagramProps {
  chromaticity?: {
    x: number;
    y: number;
  } | null;
  observer?: '2' | '10';
}

// CIE 1931 2° standard observer chromaticity coordinates for the spectral locus - Official CIE data
const SPECTRAL_LOCUS_2DEG = [
  { x: 0.17556, y: 0.00529, wavelength: 360 },
  { x: 0.17548, y: 0.00529, wavelength: 361 },
  { x: 0.17540, y: 0.00528, wavelength: 362 },
  { x: 0.17532, y: 0.00527, wavelength: 363 },
  { x: 0.17524, y: 0.00526, wavelength: 364 },
  { x: 0.17516, y: 0.00526, wavelength: 365 },
  { x: 0.17509, y: 0.00525, wavelength: 366 },
  { x: 0.17501, y: 0.00524, wavelength: 367 },
  { x: 0.17494, y: 0.00523, wavelength: 368 },
  { x: 0.17488, y: 0.00522, wavelength: 369 },
  { x: 0.17482, y: 0.00522, wavelength: 370 },
  { x: 0.17477, y: 0.00523, wavelength: 371 },
  { x: 0.17472, y: 0.00524, wavelength: 372 },
  { x: 0.17466, y: 0.00524, wavelength: 373 },
  { x: 0.17459, y: 0.00522, wavelength: 374 },
  { x: 0.17451, y: 0.00518, wavelength: 375 },
  { x: 0.17441, y: 0.00513, wavelength: 376 },
  { x: 0.17431, y: 0.00507, wavelength: 377 },
  { x: 0.17422, y: 0.00502, wavelength: 378 },
  { x: 0.17416, y: 0.00498, wavelength: 379 },
  { x: 0.17411, y: 0.00496, wavelength: 380 },
  { x: 0.17409, y: 0.00496, wavelength: 381 },
  { x: 0.17407, y: 0.00497, wavelength: 382 },
  { x: 0.17406, y: 0.00498, wavelength: 383 },
  { x: 0.17404, y: 0.00498, wavelength: 384 },
  { x: 0.17401, y: 0.00498, wavelength: 385 },
  { x: 0.17397, y: 0.00497, wavelength: 386 },
  { x: 0.17393, y: 0.00494, wavelength: 387 },
  { x: 0.17389, y: 0.00493, wavelength: 388 },
  { x: 0.17384, y: 0.00492, wavelength: 389 },
  { x: 0.17380, y: 0.00492, wavelength: 390 },
  { x: 0.17376, y: 0.00492, wavelength: 391 },
  { x: 0.17370, y: 0.00494, wavelength: 392 },
  { x: 0.17366, y: 0.00494, wavelength: 393 },
  { x: 0.17361, y: 0.00494, wavelength: 394 },
  { x: 0.17356, y: 0.00492, wavelength: 395 },
  { x: 0.17351, y: 0.00490, wavelength: 396 },
  { x: 0.17347, y: 0.00486, wavelength: 397 },
  { x: 0.17342, y: 0.00484, wavelength: 398 },
  { x: 0.17338, y: 0.00481, wavelength: 399 },
  { x: 0.17334, y: 0.00480, wavelength: 400 },
  { x: 0.17329, y: 0.00479, wavelength: 401 },
  { x: 0.17324, y: 0.00478, wavelength: 402 },
  { x: 0.17317, y: 0.00478, wavelength: 403 },
  { x: 0.17310, y: 0.00477, wavelength: 404 },
  { x: 0.17302, y: 0.00478, wavelength: 405 },
  { x: 0.17293, y: 0.00478, wavelength: 406 },
  { x: 0.17284, y: 0.00479, wavelength: 407 },
  { x: 0.17275, y: 0.00480, wavelength: 408 },
  { x: 0.17266, y: 0.00480, wavelength: 409 },
  { x: 0.17258, y: 0.00480, wavelength: 410 },
  { x: 0.17249, y: 0.00480, wavelength: 411 },
  { x: 0.17239, y: 0.00480, wavelength: 412 },
  { x: 0.17230, y: 0.00480, wavelength: 413 },
  { x: 0.17219, y: 0.00482, wavelength: 414 },
  { x: 0.17209, y: 0.00483, wavelength: 415 },
  { x: 0.17198, y: 0.00486, wavelength: 416 },
  { x: 0.17187, y: 0.00489, wavelength: 417 },
  { x: 0.17174, y: 0.00494, wavelength: 418 },
  { x: 0.17159, y: 0.00501, wavelength: 419 },
  { x: 0.17141, y: 0.00510, wavelength: 420 },
  { x: 0.17121, y: 0.00521, wavelength: 421 },
  { x: 0.17099, y: 0.00533, wavelength: 422 },
  { x: 0.17077, y: 0.00547, wavelength: 423 },
  { x: 0.17054, y: 0.00562, wavelength: 424 },
  { x: 0.17030, y: 0.00579, wavelength: 425 },
  { x: 0.17005, y: 0.00597, wavelength: 426 },
  { x: 0.16978, y: 0.00618, wavelength: 427 },
  { x: 0.16950, y: 0.00640, wavelength: 428 },
  { x: 0.16920, y: 0.00664, wavelength: 429 },
  { x: 0.16888, y: 0.00690, wavelength: 430 },
  { x: 0.16853, y: 0.00718, wavelength: 431 },
  { x: 0.16815, y: 0.00749, wavelength: 432 },
  { x: 0.16775, y: 0.00782, wavelength: 433 },
  { x: 0.16733, y: 0.00817, wavelength: 434 },
  { x: 0.16690, y: 0.00855, wavelength: 435 },
  { x: 0.16645, y: 0.00896, wavelength: 436 },
  { x: 0.16598, y: 0.00940, wavelength: 437 },
  { x: 0.16548, y: 0.00987, wavelength: 438 },
  { x: 0.16496, y: 0.01035, wavelength: 439 },
  { x: 0.16441, y: 0.01086, wavelength: 440 },
  { x: 0.16383, y: 0.01138, wavelength: 441 },
  { x: 0.16321, y: 0.01194, wavelength: 442 },
  { x: 0.16255, y: 0.01252, wavelength: 443 },
  { x: 0.16185, y: 0.01314, wavelength: 444 },
  { x: 0.16111, y: 0.01379, wavelength: 445 },
  { x: 0.16031, y: 0.01449, wavelength: 446 },
  { x: 0.15947, y: 0.01523, wavelength: 447 },
  { x: 0.15857, y: 0.01602, wavelength: 448 },
  { x: 0.15763, y: 0.01684, wavelength: 449 },
  { x: 0.15664, y: 0.01771, wavelength: 450 },
  { x: 0.15560, y: 0.01861, wavelength: 451 },
  { x: 0.15452, y: 0.01956, wavelength: 452 },
  { x: 0.15340, y: 0.02055, wavelength: 453 },
  { x: 0.15222, y: 0.02161, wavelength: 454 },
  { x: 0.15099, y: 0.02274, wavelength: 455 },
  { x: 0.14969, y: 0.02395, wavelength: 456 },
  { x: 0.14834, y: 0.02525, wavelength: 457 },
  { x: 0.14693, y: 0.02663, wavelength: 458 },
  { x: 0.14547, y: 0.02812, wavelength: 459 },
  { x: 0.14396, y: 0.02970, wavelength: 460 },
  { x: 0.14241, y: 0.03139, wavelength: 461 },
  { x: 0.14080, y: 0.03321, wavelength: 462 },
  { x: 0.13912, y: 0.03520, wavelength: 463 },
  { x: 0.13737, y: 0.03740, wavelength: 464 },
  { x: 0.13550, y: 0.03988, wavelength: 465 },
  { x: 0.13351, y: 0.04269, wavelength: 466 },
  { x: 0.13137, y: 0.04588, wavelength: 467 },
  { x: 0.12909, y: 0.04945, wavelength: 468 },
  { x: 0.12666, y: 0.05343, wavelength: 469 },
  { x: 0.12412, y: 0.05780, wavelength: 470 },
  { x: 0.12147, y: 0.06259, wavelength: 471 },
  { x: 0.11870, y: 0.06783, wavelength: 472 },
  { x: 0.11581, y: 0.07358, wavelength: 473 },
  { x: 0.11278, y: 0.07989, wavelength: 474 },
  { x: 0.10960, y: 0.08684, wavelength: 475 },
  { x: 0.10626, y: 0.09449, wavelength: 476 },
  { x: 0.10278, y: 0.10286, wavelength: 477 },
  { x: 0.09913, y: 0.11201, wavelength: 478 },
  { x: 0.09531, y: 0.12194, wavelength: 479 },
  { x: 0.09129, y: 0.13270, wavelength: 480 },
  { x: 0.08708, y: 0.14432, wavelength: 481 },
  { x: 0.08268, y: 0.15687, wavelength: 482 },
  { x: 0.07812, y: 0.17042, wavelength: 483 },
  { x: 0.07344, y: 0.18503, wavelength: 484 },
  { x: 0.06871, y: 0.20072, wavelength: 485 },
  { x: 0.06399, y: 0.21747, wavelength: 486 },
  { x: 0.05932, y: 0.23525, wavelength: 487 },
  { x: 0.05467, y: 0.25409, wavelength: 488 },
  { x: 0.05003, y: 0.27400, wavelength: 489 },
  { x: 0.04539, y: 0.29498, wavelength: 490 },
  { x: 0.04076, y: 0.31698, wavelength: 491 },
  { x: 0.03620, y: 0.33990, wavelength: 492 },
  { x: 0.03176, y: 0.36360, wavelength: 493 },
  { x: 0.02749, y: 0.38792, wavelength: 494 },
  { x: 0.02346, y: 0.41270, wavelength: 495 },
  { x: 0.01970, y: 0.43776, wavelength: 496 },
  { x: 0.01627, y: 0.46295, wavelength: 497 },
  { x: 0.01318, y: 0.48821, wavelength: 498 },
  { x: 0.01048, y: 0.51340, wavelength: 499 },
  { x: 0.00817, y: 0.53842, wavelength: 500 },
  { x: 0.00628, y: 0.56307, wavelength: 501 },
  { x: 0.00487, y: 0.58712, wavelength: 502 },
  { x: 0.00398, y: 0.61045, wavelength: 503 },
  { x: 0.00364, y: 0.63301, wavelength: 504 },
  { x: 0.00386, y: 0.65482, wavelength: 505 },
  { x: 0.00464, y: 0.67590, wavelength: 506 },
  { x: 0.00601, y: 0.69612, wavelength: 507 },
  { x: 0.00799, y: 0.71534, wavelength: 508 },
  { x: 0.01060, y: 0.73341, wavelength: 509 },
  { x: 0.01387, y: 0.75019, wavelength: 510 },
  { x: 0.01777, y: 0.76561, wavelength: 511 },
  { x: 0.02224, y: 0.77963, wavelength: 512 },
  { x: 0.02727, y: 0.79211, wavelength: 513 },
  { x: 0.03282, y: 0.80293, wavelength: 514 },
  { x: 0.03885, y: 0.81202, wavelength: 515 },
  { x: 0.04533, y: 0.81939, wavelength: 516 },
  { x: 0.05218, y: 0.82516, wavelength: 517 },
  { x: 0.05932, y: 0.82943, wavelength: 518 },
  { x: 0.06672, y: 0.83227, wavelength: 519 },
  { x: 0.07430, y: 0.83380, wavelength: 520 },
  { x: 0.08205, y: 0.83409, wavelength: 521 },
  { x: 0.08994, y: 0.83329, wavelength: 522 },
  { x: 0.09794, y: 0.83159, wavelength: 523 },
  { x: 0.10602, y: 0.82918, wavelength: 524 },
  { x: 0.11416, y: 0.82621, wavelength: 525 },
  { x: 0.12235, y: 0.82277, wavelength: 526 },
  { x: 0.13055, y: 0.81893, wavelength: 527 },
  { x: 0.13870, y: 0.81478, wavelength: 528 },
  { x: 0.14677, y: 0.81040, wavelength: 529 },
  { x: 0.15472, y: 0.80586, wavelength: 530 },
  { x: 0.16253, y: 0.80124, wavelength: 531 },
  { x: 0.17024, y: 0.79652, wavelength: 532 },
  { x: 0.17785, y: 0.79169, wavelength: 533 },
  { x: 0.18539, y: 0.78673, wavelength: 534 },
  { x: 0.19288, y: 0.78163, wavelength: 535 },
  { x: 0.20031, y: 0.77640, wavelength: 536 },
  { x: 0.20769, y: 0.77105, wavelength: 537 },
  { x: 0.21503, y: 0.76559, wavelength: 538 },
  { x: 0.22234, y: 0.76002, wavelength: 539 },
  { x: 0.22962, y: 0.75433, wavelength: 540 },
  { x: 0.23689, y: 0.74852, wavelength: 541 },
  { x: 0.24413, y: 0.74262, wavelength: 542 },
  { x: 0.25136, y: 0.73661, wavelength: 543 },
  { x: 0.25858, y: 0.73051, wavelength: 544 },
  { x: 0.26578, y: 0.72432, wavelength: 545 },
  { x: 0.27296, y: 0.71806, wavelength: 546 },
  { x: 0.28013, y: 0.71172, wavelength: 547 },
  { x: 0.28729, y: 0.70532, wavelength: 548 },
  { x: 0.29445, y: 0.69884, wavelength: 549 },
  { x: 0.30160, y: 0.69231, wavelength: 550 },
  { x: 0.30876, y: 0.68571, wavelength: 551 },
  { x: 0.31592, y: 0.67906, wavelength: 552 },
  { x: 0.32306, y: 0.67237, wavelength: 553 },
  { x: 0.33021, y: 0.66563, wavelength: 554 },
  { x: 0.33736, y: 0.65885, wavelength: 555 },
  { x: 0.34451, y: 0.65203, wavelength: 556 },
  { x: 0.35167, y: 0.64517, wavelength: 557 },
  { x: 0.35881, y: 0.63829, wavelength: 558 },
  { x: 0.36596, y: 0.63138, wavelength: 559 },
  { x: 0.37310, y: 0.62445, wavelength: 560 },
  { x: 0.38024, y: 0.61750, wavelength: 561 },
  { x: 0.38738, y: 0.61054, wavelength: 562 },
  { x: 0.39451, y: 0.60357, wavelength: 563 },
  { x: 0.40163, y: 0.59659, wavelength: 564 },
  { x: 0.40873, y: 0.58961, wavelength: 565 },
  { x: 0.41583, y: 0.58262, wavelength: 566 },
  { x: 0.42292, y: 0.57563, wavelength: 567 },
  { x: 0.42999, y: 0.56865, wavelength: 568 },
  { x: 0.43704, y: 0.56167, wavelength: 569 },
  { x: 0.44406, y: 0.55472, wavelength: 570 },
  { x: 0.45106, y: 0.54777, wavelength: 571 },
  { x: 0.45804, y: 0.54084, wavelength: 572 },
  { x: 0.46499, y: 0.53393, wavelength: 573 },
  { x: 0.47190, y: 0.52705, wavelength: 574 },
  { x: 0.47878, y: 0.52020, wavelength: 575 },
  { x: 0.48561, y: 0.51339, wavelength: 576 },
  { x: 0.49241, y: 0.50661, wavelength: 577 },
  { x: 0.49915, y: 0.49989, wavelength: 578 },
  { x: 0.50585, y: 0.49321, wavelength: 579 },
  { x: 0.51249, y: 0.48659, wavelength: 580 },
  { x: 0.51907, y: 0.48003, wavelength: 581 },
  { x: 0.52560, y: 0.47353, wavelength: 582 },
  { x: 0.53207, y: 0.46709, wavelength: 583 },
  { x: 0.53846, y: 0.46073, wavelength: 584 },
  { x: 0.54479, y: 0.45443, wavelength: 585 },
  { x: 0.55103, y: 0.44823, wavelength: 586 },
  { x: 0.55719, y: 0.44210, wavelength: 587 },
  { x: 0.56327, y: 0.43606, wavelength: 588 },
  { x: 0.56926, y: 0.43010, wavelength: 589 },
  { x: 0.57515, y: 0.42423, wavelength: 590 },
  { x: 0.58094, y: 0.41846, wavelength: 591 },
  { x: 0.58665, y: 0.41276, wavelength: 592 },
  { x: 0.59222, y: 0.40719, wavelength: 593 },
  { x: 0.59766, y: 0.40176, wavelength: 594 },
  { x: 0.60293, y: 0.39650, wavelength: 595 },
  { x: 0.60803, y: 0.39141, wavelength: 596 },
  { x: 0.61298, y: 0.38648, wavelength: 597 },
  { x: 0.61778, y: 0.38171, wavelength: 598 },
  { x: 0.62246, y: 0.37705, wavelength: 599 },
  { x: 0.62704, y: 0.37249, wavelength: 600 },
  { x: 0.63152, y: 0.36803, wavelength: 601 },
  { x: 0.63590, y: 0.36367, wavelength: 602 },
  { x: 0.64016, y: 0.35943, wavelength: 603 },
  { x: 0.64427, y: 0.35533, wavelength: 604 },
  { x: 0.64823, y: 0.35140, wavelength: 605 },
  { x: 0.65203, y: 0.34763, wavelength: 606 },
  { x: 0.65567, y: 0.34402, wavelength: 607 },
  { x: 0.65917, y: 0.34055, wavelength: 608 },
  { x: 0.66253, y: 0.33722, wavelength: 609 },
  { x: 0.66576, y: 0.33401, wavelength: 610 },
  { x: 0.66887, y: 0.33092, wavelength: 611 },
  { x: 0.67186, y: 0.32795, wavelength: 612 },
  { x: 0.67472, y: 0.32509, wavelength: 613 },
  { x: 0.67746, y: 0.32236, wavelength: 614 },
  { x: 0.68008, y: 0.31975, wavelength: 615 },
  { x: 0.68258, y: 0.31725, wavelength: 616 },
  { x: 0.68497, y: 0.31486, wavelength: 617 },
  { x: 0.68725, y: 0.31259, wavelength: 618 },
  { x: 0.68943, y: 0.31041, wavelength: 619 },
  { x: 0.69151, y: 0.30834, wavelength: 620 },
  { x: 0.69349, y: 0.30637, wavelength: 621 },
  { x: 0.69539, y: 0.30448, wavelength: 622 },
  { x: 0.69721, y: 0.30267, wavelength: 623 },
  { x: 0.69894, y: 0.30095, wavelength: 624 },
  { x: 0.70061, y: 0.29930, wavelength: 625 },
  { x: 0.70219, y: 0.29773, wavelength: 626 },
  { x: 0.70371, y: 0.29622, wavelength: 627 },
  { x: 0.70516, y: 0.29477, wavelength: 628 },
  { x: 0.70656, y: 0.29338, wavelength: 629 },
  { x: 0.70792, y: 0.29203, wavelength: 630 },
  { x: 0.70923, y: 0.29072, wavelength: 631 },
  { x: 0.71050, y: 0.28945, wavelength: 632 },
  { x: 0.71173, y: 0.28823, wavelength: 633 },
  { x: 0.71290, y: 0.28706, wavelength: 634 },
  { x: 0.71403, y: 0.28593, wavelength: 635 },
  { x: 0.71512, y: 0.28484, wavelength: 636 },
  { x: 0.71616, y: 0.28380, wavelength: 637 },
  { x: 0.71716, y: 0.28281, wavelength: 638 },
  { x: 0.71812, y: 0.28185, wavelength: 639 },
  { x: 0.71903, y: 0.28094, wavelength: 640 },
  { x: 0.71991, y: 0.28006, wavelength: 641 },
  { x: 0.72075, y: 0.27922, wavelength: 642 },
  { x: 0.72155, y: 0.27842, wavelength: 643 },
  { x: 0.72232, y: 0.27766, wavelength: 644 },
  { x: 0.72303, y: 0.27695, wavelength: 645 },
  { x: 0.72370, y: 0.27628, wavelength: 646 },
  { x: 0.72433, y: 0.27566, wavelength: 647 },
  { x: 0.72491, y: 0.27508, wavelength: 648 },
  { x: 0.72547, y: 0.27453, wavelength: 649 },
  { x: 0.72599, y: 0.27401, wavelength: 650 },
  { x: 0.72649, y: 0.27351, wavelength: 651 },
  { x: 0.72698, y: 0.27302, wavelength: 652 },
  { x: 0.72743, y: 0.27257, wavelength: 653 },
  { x: 0.72786, y: 0.27214, wavelength: 654 },
  { x: 0.72827, y: 0.27173, wavelength: 655 },
  { x: 0.72866, y: 0.27134, wavelength: 656 },
  { x: 0.72902, y: 0.27098, wavelength: 657 },
  { x: 0.72936, y: 0.27064, wavelength: 658 },
  { x: 0.72968, y: 0.27032, wavelength: 659 },
  { x: 0.72997, y: 0.27003, wavelength: 660 },
  { x: 0.73023, y: 0.26977, wavelength: 661 },
  { x: 0.73047, y: 0.26953, wavelength: 662 },
  { x: 0.73069, y: 0.26931, wavelength: 663 },
  { x: 0.73090, y: 0.26910, wavelength: 664 },
  { x: 0.73109, y: 0.26891, wavelength: 665 },
  { x: 0.73128, y: 0.26872, wavelength: 666 },
  { x: 0.73147, y: 0.26853, wavelength: 667 },
  { x: 0.73165, y: 0.26835, wavelength: 668 },
  { x: 0.73183, y: 0.26817, wavelength: 669 },
  { x: 0.73199, y: 0.26801, wavelength: 670 },
  { x: 0.73215, y: 0.26785, wavelength: 671 },
  { x: 0.73230, y: 0.26770, wavelength: 672 },
  { x: 0.73244, y: 0.26756, wavelength: 673 },
  { x: 0.73258, y: 0.26742, wavelength: 674 },
  { x: 0.73272, y: 0.26728, wavelength: 675 },
  { x: 0.73286, y: 0.26714, wavelength: 676 },
  { x: 0.73300, y: 0.26700, wavelength: 677 },
  { x: 0.73314, y: 0.26686, wavelength: 678 },
  { x: 0.73328, y: 0.26672, wavelength: 679 },
  { x: 0.73342, y: 0.26658, wavelength: 680 },
  { x: 0.73355, y: 0.26645, wavelength: 681 },
  { x: 0.73368, y: 0.26632, wavelength: 682 },
  { x: 0.73381, y: 0.26619, wavelength: 683 },
  { x: 0.73394, y: 0.26606, wavelength: 684 },
  { x: 0.73405, y: 0.26595, wavelength: 685 },
  { x: 0.73414, y: 0.26586, wavelength: 686 },
  { x: 0.73422, y: 0.26578, wavelength: 687 },
  { x: 0.73429, y: 0.26571, wavelength: 688 },
  { x: 0.73434, y: 0.26566, wavelength: 689 },
  { x: 0.73439, y: 0.26561, wavelength: 690 },
  { x: 0.73444, y: 0.26556, wavelength: 691 },
  { x: 0.73448, y: 0.26552, wavelength: 692 },
  { x: 0.73452, y: 0.26548, wavelength: 693 },
  { x: 0.73456, y: 0.26544, wavelength: 694 },
  { x: 0.73459, y: 0.26541, wavelength: 695 },
  { x: 0.73462, y: 0.26538, wavelength: 696 },
  { x: 0.73465, y: 0.26535, wavelength: 697 },
  { x: 0.73467, y: 0.26533, wavelength: 698 },
  { x: 0.73469, y: 0.26531, wavelength: 699 },
  { x: 0.73469, y: 0.26531, wavelength: 700 },
  { x: 0.73469, y: 0.26531, wavelength: 701 },
  { x: 0.73469, y: 0.26531, wavelength: 702 },
  { x: 0.73469, y: 0.26531, wavelength: 703 },
  { x: 0.73469, y: 0.26531, wavelength: 704 },
  { x: 0.73469, y: 0.26531, wavelength: 705 },
  { x: 0.73469, y: 0.26531, wavelength: 706 },
  { x: 0.73469, y: 0.26531, wavelength: 707 },
  { x: 0.73469, y: 0.26531, wavelength: 708 },
  { x: 0.73469, y: 0.26531, wavelength: 709 },
  { x: 0.73469, y: 0.26531, wavelength: 710 },
  { x: 0.73469, y: 0.26531, wavelength: 711 },
  { x: 0.73469, y: 0.26531, wavelength: 712 },
  { x: 0.73469, y: 0.26531, wavelength: 713 },
  { x: 0.73469, y: 0.26531, wavelength: 714 },
  { x: 0.73469, y: 0.26531, wavelength: 715 },
  { x: 0.73469, y: 0.26531, wavelength: 716 },
  { x: 0.73469, y: 0.26531, wavelength: 717 },
  { x: 0.73469, y: 0.26531, wavelength: 718 },
  { x: 0.73469, y: 0.26531, wavelength: 719 },
  { x: 0.73469, y: 0.26531, wavelength: 720 },
  { x: 0.73469, y: 0.26531, wavelength: 721 },
  { x: 0.73469, y: 0.26531, wavelength: 722 },
  { x: 0.73469, y: 0.26531, wavelength: 723 },
  { x: 0.73469, y: 0.26531, wavelength: 724 },
  { x: 0.73469, y: 0.26531, wavelength: 725 },
  { x: 0.73469, y: 0.26531, wavelength: 726 },
  { x: 0.73469, y: 0.26531, wavelength: 727 },
  { x: 0.73469, y: 0.26531, wavelength: 728 },
  { x: 0.73469, y: 0.26531, wavelength: 729 },
  { x: 0.73469, y: 0.26531, wavelength: 730 },
  { x: 0.73469, y: 0.26531, wavelength: 731 },
  { x: 0.73469, y: 0.26531, wavelength: 732 },
  { x: 0.73469, y: 0.26531, wavelength: 733 },
  { x: 0.73469, y: 0.26531, wavelength: 734 },
  { x: 0.73469, y: 0.26531, wavelength: 735 },
  { x: 0.73469, y: 0.26531, wavelength: 736 },
  { x: 0.73469, y: 0.26531, wavelength: 737 },
  { x: 0.73469, y: 0.26531, wavelength: 738 },
  { x: 0.73469, y: 0.26531, wavelength: 739 },
  { x: 0.73469, y: 0.26531, wavelength: 740 },
  { x: 0.73469, y: 0.26531, wavelength: 741 },
  { x: 0.73469, y: 0.26531, wavelength: 742 },
  { x: 0.73469, y: 0.26531, wavelength: 743 },
  { x: 0.73469, y: 0.26531, wavelength: 744 },
  { x: 0.73469, y: 0.26531, wavelength: 745 },
  { x: 0.73469, y: 0.26531, wavelength: 746 },
  { x: 0.73469, y: 0.26531, wavelength: 747 },
  { x: 0.73469, y: 0.26531, wavelength: 748 },
  { x: 0.73469, y: 0.26531, wavelength: 749 },
  { x: 0.73469, y: 0.26531, wavelength: 750 },
  { x: 0.73469, y: 0.26531, wavelength: 751 },
  { x: 0.73469, y: 0.26531, wavelength: 752 },
  { x: 0.73469, y: 0.26531, wavelength: 753 },
  { x: 0.73469, y: 0.26531, wavelength: 754 },
  { x: 0.73469, y: 0.26531, wavelength: 755 },
  { x: 0.73469, y: 0.26531, wavelength: 756 },
  { x: 0.73469, y: 0.26531, wavelength: 757 },
  { x: 0.73469, y: 0.26531, wavelength: 758 },
  { x: 0.73469, y: 0.26531, wavelength: 759 },
  { x: 0.73469, y: 0.26531, wavelength: 760 },
  { x: 0.73469, y: 0.26531, wavelength: 761 },
  { x: 0.73469, y: 0.26531, wavelength: 762 },
  { x: 0.73469, y: 0.26531, wavelength: 763 },
  { x: 0.73469, y: 0.26531, wavelength: 764 },
  { x: 0.73469, y: 0.26531, wavelength: 765 },
  { x: 0.73469, y: 0.26531, wavelength: 766 },
  { x: 0.73469, y: 0.26531, wavelength: 767 },
  { x: 0.73469, y: 0.26531, wavelength: 768 },
  { x: 0.73469, y: 0.26531, wavelength: 769 },
  { x: 0.73469, y: 0.26531, wavelength: 770 },
  { x: 0.73469, y: 0.26531, wavelength: 771 },
  { x: 0.73469, y: 0.26531, wavelength: 772 },
  { x: 0.73469, y: 0.26531, wavelength: 773 },
  { x: 0.73469, y: 0.26531, wavelength: 774 },
  { x: 0.73469, y: 0.26531, wavelength: 775 },
  { x: 0.73469, y: 0.26531, wavelength: 776 },
  { x: 0.73469, y: 0.26531, wavelength: 777 },
  { x: 0.73469, y: 0.26531, wavelength: 778 },
  { x: 0.73469, y: 0.26531, wavelength: 779 },
  { x: 0.73469, y: 0.26531, wavelength: 780 },
  { x: 0.73469, y: 0.26531, wavelength: 781 },
  { x: 0.73469, y: 0.26531, wavelength: 782 },
  { x: 0.73469, y: 0.26531, wavelength: 783 },
  { x: 0.73469, y: 0.26531, wavelength: 784 },
  { x: 0.73469, y: 0.26531, wavelength: 785 },
  { x: 0.73469, y: 0.26531, wavelength: 786 },
  { x: 0.73469, y: 0.26531, wavelength: 787 },
  { x: 0.73469, y: 0.26531, wavelength: 788 },
  { x: 0.73469, y: 0.26531, wavelength: 789 },
  { x: 0.73469, y: 0.26531, wavelength: 790 },
  { x: 0.73469, y: 0.26531, wavelength: 791 },
  { x: 0.73469, y: 0.26531, wavelength: 792 },
  { x: 0.73469, y: 0.26531, wavelength: 793 },
  { x: 0.73469, y: 0.26531, wavelength: 794 },
  { x: 0.73469, y: 0.26531, wavelength: 795 },
  { x: 0.73469, y: 0.26531, wavelength: 796 },
  { x: 0.73469, y: 0.26531, wavelength: 797 },
  { x: 0.73469, y: 0.26531, wavelength: 798 },
  { x: 0.73469, y: 0.26531, wavelength: 799 },
  { x: 0.73469, y: 0.26531, wavelength: 800 },
  { x: 0.73469, y: 0.26531, wavelength: 801 },
  { x: 0.73469, y: 0.26531, wavelength: 802 },
  { x: 0.73469, y: 0.26531, wavelength: 803 },
  { x: 0.73469, y: 0.26531, wavelength: 804 },
  { x: 0.73469, y: 0.26531, wavelength: 805 },
  { x: 0.73469, y: 0.26531, wavelength: 806 },
  { x: 0.73469, y: 0.26531, wavelength: 807 },
  { x: 0.73469, y: 0.26531, wavelength: 808 },
  { x: 0.73469, y: 0.26531, wavelength: 809 },
  { x: 0.73469, y: 0.26531, wavelength: 810 },
  { x: 0.73469, y: 0.26531, wavelength: 811 },
  { x: 0.73469, y: 0.26531, wavelength: 812 },
  { x: 0.73469, y: 0.26531, wavelength: 813 },
  { x: 0.73469, y: 0.26531, wavelength: 814 },
  { x: 0.73469, y: 0.26531, wavelength: 815 },
  { x: 0.73469, y: 0.26531, wavelength: 816 },
  { x: 0.73469, y: 0.26531, wavelength: 817 },
  { x: 0.73469, y: 0.26531, wavelength: 818 },
  { x: 0.73469, y: 0.26531, wavelength: 819 },
  { x: 0.73469, y: 0.26531, wavelength: 820 },
  { x: 0.73469, y: 0.26531, wavelength: 821 },
  { x: 0.73469, y: 0.26531, wavelength: 822 },
  { x: 0.73469, y: 0.26531, wavelength: 823 },
  { x: 0.73469, y: 0.26531, wavelength: 824 },
  { x: 0.73469, y: 0.26531, wavelength: 825 },
  { x: 0.73469, y: 0.26531, wavelength: 826 },
  { x: 0.73469, y: 0.26531, wavelength: 827 },
  { x: 0.73469, y: 0.26531, wavelength: 828 },
  { x: 0.73469, y: 0.26531, wavelength: 829 },
  { x: 0.73469, y: 0.26531, wavelength: 830 }
];

// Purple boundary (line of purples) - connects 360nm to 830nm
const PURPLE_LINE = [
  { x: 0.17556, y: 0.00529 }, // 360nm
  { x: 0.73469, y: 0.26531 }  // 830nm
];

// Standard illuminant coordinates
const ILLUMINANTS = {
  A: { x: 0.44757, y: 0.40745, name: "A (2856K)" },
  C: { x: 0.31006, y: 0.31616, name: "C (6774K)" },
  D50: { x: 0.34567, y: 0.35850, name: "D50 (5003K)" },
  D55: { x: 0.33242, y: 0.34743, name: "D55 (5503K)" },
  D65: { x: 0.31271, y: 0.32902, name: "D65 (6504K)" },
  D75: { x: 0.29902, y: 0.31485, name: "D75 (7504K)" },
  F2: { x: 0.37208, y: 0.37529, name: "F2 (4230K)" },
  F7: { x: 0.31292, y: 0.32933, name: "F7 (6500K)" },
  F11: { x: 0.38052, y: 0.37713, name: "F11 (4000K)" }
};

// Wavelength labels for key points
const WAVELENGTH_LABELS = [
  { wavelength: 380, x: 0.17411, y: 0.00496 },
  { wavelength: 400, x: 0.17334, y: 0.00480 },
  { wavelength: 450, x: 0.15664, y: 0.01771 },
  { wavelength: 500, x: 0.00817, y: 0.53842 },
  { wavelength: 520, x: 0.07430, y: 0.83380 },
  { wavelength: 550, x: 0.30160, y: 0.69231 },
  { wavelength: 580, x: 0.51249, y: 0.48659 },
  { wavelength: 600, x: 0.62704, y: 0.37249 },
  { wavelength: 650, x: 0.72599, y: 0.27401 },
  { wavelength: 700, x: 0.73469, y: 0.26531 }
];

// Function to convert wavelength to approximate RGB color for parametric display
function wavelengthToRGB(wavelength: number): string {
  let r = 0, g = 0, b = 0;
  
  if (wavelength >= 380 && wavelength <= 440) {
    r = -(wavelength - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (wavelength >= 440 && wavelength <= 490) {
    r = 0.0;
    g = (wavelength - 440) / (490 - 440);
    b = 1.0;
  } else if (wavelength >= 490 && wavelength <= 510) {
    r = 0.0;
    g = 1.0;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength <= 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wavelength >= 580 && wavelength <= 645) {
    r = 1.0;
    g = -(wavelength - 645) / (645 - 580);
    b = 0.0;
  } else if (wavelength >= 645 && wavelength <= 750) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  }
  
  // Intensity correction near the vision limits
  let factor = 1.0;
  if (wavelength >= 380 && wavelength <= 420) {
    factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
  } else if (wavelength >= 700 && wavelength <= 750) {
    factor = 0.3 + 0.7 * (750 - wavelength) / (750 - 700);
  }
  
  r = Math.round(255 * r * factor);
  g = Math.round(255 * g * factor);
  b = Math.round(255 * b * factor);
  
  return `rgb(${r},${g},${b})`;
}

const ChromaticityDiagram: React.FC<ChromaticityDiagramProps> = ({ 
  chromaticity, 
  observer = '2' 
}) => {
  // Create the spectral locus data for plotting
  const spectralLocusData = SPECTRAL_LOCUS_2DEG.map(point => ({
    x: point.x,
    y: point.y,
    wavelength: point.wavelength
  }));

  // Current color point
  const colorPoint = chromaticity ? [{ 
    x: chromaticity.x, 
    y: chromaticity.y, 
    type: 'color' 
  }] : [];

  // Illuminant points
  const illuminantPoints = Object.entries(ILLUMINANTS).map(([key, data]) => ({
    x: data.x,
    y: data.y,
    name: key,
    fullName: data.name,
    type: 'illuminant'
  }));

  return (
    <div className="w-full bg-card rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4 text-center">
        CIE 1931 Chromaticity Diagram ({observer}° Observer)
      </h3>
      
      {/* Parametric Color Bar */}
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Spectral Colors (380-700nm)</div>
        <div className="h-6 rounded flex overflow-hidden border border-border">
          {Array.from({ length: 33 }, (_, i) => {
            const wavelength = 380 + i * 10;
            return (
              <div
                key={wavelength}
                className="flex-1 relative group cursor-pointer"
                style={{ backgroundColor: wavelengthToRGB(wavelength) }}
                title={`${wavelength}nm`}
              >
                {wavelength % 50 === 0 && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 text-xs text-foreground/70 mb-1">
                    {wavelength}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
            data={spectralLocusData}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              type="number"
              dataKey="x"
              domain={[0, 0.8]}
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              label={{ value: 'CIE x', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 14, fontWeight: 'bold' } }}
            />
            <YAxis 
              type="number"
              dataKey="y"
              domain={[0, 0.9]}
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              label={{ value: 'CIE y', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 14, fontWeight: 'bold' } }}
            />
            
            {/* Spectral locus boundary */}
            <Scatter 
              data={spectralLocusData} 
              fill="none"
              line={{ stroke: 'hsl(var(--primary))', strokeWidth: 3 }}
              shape="circle"
              r={0}
            />
            
            {/* Purple line */}
            <Scatter 
              data={PURPLE_LINE} 
              fill="transparent"
              line={{ stroke: 'hsl(var(--primary))', strokeWidth: 3, strokeDasharray: '8,4' }}
              shape="circle"
              r={0}
            />
            
            {/* Wavelength points and labels */}
            {WAVELENGTH_LABELS.map((label, i) => (
              <g key={`wl-group-${i}`}>
                <circle
                  cx={label.x * 800 + 60}
                  cy={500 - label.y * 444 + 20}
                  r="3"
                  fill="hsl(var(--primary))"
                  stroke="white"
                  strokeWidth="2"
                />
                <text 
                  x={label.x * 800 + 60} 
                  y={500 - label.y * 444 + 20 - 10}
                  fontSize="11"
                  fontWeight="bold"
                  fill="hsl(var(--foreground))"
                  textAnchor="middle"
                  stroke="hsl(var(--background))"
                  strokeWidth="2"
                  paintOrder="stroke"
                >
                  {label.wavelength}
                </text>
              </g>
            ))}
            
            {/* Illuminant points */}
            <Scatter data={illuminantPoints}>
              {illuminantPoints.map((entry, index) => (
                <Cell key={`illuminant-${index}`} fill="hsl(var(--secondary))" r={5} stroke="white" strokeWidth={2} />
              ))}
            </Scatter>
            
            {/* Illuminant labels */}
            {illuminantPoints.map((point, i) => (
              <text 
                key={`ill-${i}`}
                x={point.x * 800 + 60} 
                y={500 - point.y * 444 + 20 - 15}
                fontSize="10"
                fontWeight="bold"
                fill="hsl(var(--secondary-foreground))"
                textAnchor="middle"
                stroke="hsl(var(--background))"
                strokeWidth="2"
                paintOrder="stroke"
              >
                {point.fullName}
              </text>
            ))}
            
            {/* Current color point */}
            {colorPoint.length > 0 && (
              <Scatter data={colorPoint}>
                <Cell fill="hsl(var(--destructive))" r={8} stroke="white" strokeWidth={3} />
              </Scatter>
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-primary"></div>
          <span>Spectral Locus</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 border-t-2 border-dashed border-primary"></div>
          <span>Purple Line</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary border-2 border-white"></div>
          <span>Wavelength Markers</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary border-2 border-white"></div>
          <span>Standard Illuminants</span>
        </div>
        {chromaticity && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-destructive border-2 border-white"></div>
            <span>Current Color (x={chromaticity.x.toFixed(4)}, y={chromaticity.y.toFixed(4)})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChromaticityDiagram;