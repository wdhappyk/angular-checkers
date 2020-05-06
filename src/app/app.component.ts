import { Component, OnInit } from '@angular/core';

enum Color {
  White = 'white',
  Black = 'black',
  Cream = '#fffdd0',
  Brown = 'brown',
}

const BOARD_SIZE = 8;
const CELL_SIZE = 70;
const CHECKER_SIZE = 50;

class Checker {
  static color: Color;
  isKing = false;

  constructor(
    public color: Color,
    public borderColor: Color,
    public x: number,
    public y: number,
  ) {}
}

class WhiteChecker extends Checker {
  static color = Color.White;

  constructor(x: number, y: number) {
    super(WhiteChecker.color, Color.Black, x, y);
  }
}

class BlackChecker extends Checker {
  static color = Color.Black;

  constructor(x: number, y: number) {
    super(BlackChecker.color, Color.White, x, y);
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  cellSize = CELL_SIZE;
  checkerSize = CHECKER_SIZE;
  dtSize = this.cellSize - this.checkerSize;
  dthSize = this.dtSize / 2;
  fields: Color[][] = [
    [Color.Cream, Color.Brown, Color.Cream, Color.Brown, Color.Cream, Color.Brown, Color.Cream, Color.Brown],
    [Color.Brown, Color.Cream, Color.Brown, Color.Cream, Color.Brown, Color.Cream, Color.Brown, Color.Cream],
    [Color.Cream, Color.Brown, Color.Cream, Color.Brown, Color.Cream, Color.Brown, Color.Cream, Color.Brown],
    [Color.Brown, Color.Cream, Color.Brown, Color.Cream, Color.Brown, Color.Cream, Color.Brown, Color.Cream],
    [Color.Cream, Color.Brown, Color.Cream, Color.Brown, Color.Cream, Color.Brown, Color.Cream, Color.Brown],
    [Color.Brown, Color.Cream, Color.Brown, Color.Cream, Color.Brown, Color.Cream, Color.Brown, Color.Cream],
    [Color.Cream, Color.Brown, Color.Cream, Color.Brown, Color.Cream, Color.Brown, Color.Cream, Color.Brown],
    [Color.Brown, Color.Cream, Color.Brown, Color.Cream, Color.Brown, Color.Cream, Color.Brown, Color.Cream],
  ];
  checkers: Checker[] = [];
  selectedChecker?: Checker;
  possibleMoves: Array<[number, number]> = [];
  avangard: Checker[] = [];
  currentPlay = Color.White;
  isGameOver = false;
  winner: Color;

  ngOnInit() {
    this.newGame();
  }

  newGame(): void {
    this.checkers = [
      new WhiteChecker(0, 7),
      new WhiteChecker(2, 7),
      new WhiteChecker(4, 7),
      new WhiteChecker(6, 7),
      new WhiteChecker(1, 6),
      new WhiteChecker(3, 6),
      new WhiteChecker(5, 6),
      new WhiteChecker(7, 6),
      new WhiteChecker(0, 5),
      new WhiteChecker(2, 5),
      new WhiteChecker(4, 5),
      new WhiteChecker(6, 5),
      // --
      new BlackChecker(1, 0),
      new BlackChecker(3, 0),
      new BlackChecker(5, 0),
      new BlackChecker(7, 0),
      new BlackChecker(0, 1),
      new BlackChecker(2, 1),
      new BlackChecker(4, 1),
      new BlackChecker(6, 1),
      new BlackChecker(1, 2),
      new BlackChecker(3, 2),
      new BlackChecker(5, 2),
      new BlackChecker(7, 2),
    ];
    this.selectedChecker = null;
    this.possibleMoves = [];
    this.avangard = [];
    this.currentPlay = Color.White;
    this.isGameOver = false;
    this.winner = null;
  }


  checkerStyle(checker: Checker): object {
    return {
      width: `${this.checkerSize}px`,
      height: `${this.checkerSize}px`,
      backgroundColor: checker.color,
      marginLeft: `${this.cellSize * checker.x + this.dthSize}px`,
      marginTop: `${this.cellSize * checker.y + this.dthSize}px`,
      borderColor: checker.borderColor,
    };
  }

  hasChecker(x: number, y: number): Checker | null {
    return this.checkers.find((c) => c.x === x && c.y === y) || null;
  }

  selectChecker(checker: Checker): void {
    if (checker.color !== this.currentPlay || this.avangard.length && this.avangard.indexOf(checker) === -1) {
      return;
    }

    this.selectedChecker = this.selectedChecker !== checker ? checker : null;
    this.possibleMoves = this.calcPossibleMoves();
  }

  calcPossibleMoves(checker = this.selectedChecker): Array<[number, number]> {
    this.possibleMoves = [];
    if (!checker) { return []; }

    const isWhite = checker instanceof WhiteChecker;
    const isKing = checker.isKing;
    const canAttack = this.canAttack(checker);
    const possibleMoves = [];

    const helper = (k) => {
      const x = checker.x;
      const y = checker.y + k;
      const left: [number, number] = [x - 1, y];
      const right: [number, number] = [x + 1, y];

      if (y >= BOARD_SIZE || y < 0) {
        return;
      }

      const check = (coords, n) => {
        if (coords[0] >= 0 && coords[0] < BOARD_SIZE) {
          const c = this.hasChecker(coords[0], coords[1]);

          if (c) {
            coords = [x + n, y + k];

            if (!this.hasChecker(coords[0], coords[1]) && c.color !== checker.color) {
              possibleMoves.push(coords);
            }
          } else if (!canAttack) {
            possibleMoves.push(coords);
          }
        }
      };

      check(left, -2);
      check(right, 2);
    };

    if (isKing) {
      helper(1);
      helper(-1);
    } else {
      const k = isWhite ? -1 : 1;
      helper(k);
    }

    return possibleMoves;
  }

  isPossibleMove(x, y): boolean {
    return !!this.possibleMoves.find((c) => c[0] === x && c[1] === y);
  }

  moveTo(x: number, y: number): void {
    if (!this.selectedChecker || !this.isPossibleMove(x, y)) {
      return;
    }

    let isKill = false;
    const checker = this.selectedChecker;
    const kx = checker.x > x ? -1 : 1;
    const ky = checker.y > y ? -1 : 1;

    for (let fx = checker.x, fy = checker.y; fx !== x || fy !== y; fx += kx, fy += ky) {
      const enemy = this.hasChecker(fx, fy);

      if (enemy && enemy !== checker) {
        this.deleteChecker(enemy);
        isKill = true;
      }
    }

    checker.x = x;
    checker.y = y;

    if (!checker.isKing) {
      const isWhite = checker instanceof WhiteChecker;
      if (isWhite) {
        if (y === 0) {
          checker.isKing = true;
        }
      } else {
        if (y === BOARD_SIZE - 1) {
          checker.isKing = true;
        }
      }
    }

    if (isKill && this.canAttack()) {
      this.possibleMoves = this.calcPossibleMoves();
      return;
    }

    this.resetSelect();
    this.nextStep();
  }

  canAttack(checker = this.selectedChecker): boolean {
    if (!checker) {
      return false;
    }

    const helper: (k: number) => boolean = (k) => {
      const y = checker.y + k;
      const ya = y + k;
      const lxa = checker.x - 2;
      const rxa = checker.x + 2;

      const leftChecker = this.hasChecker(checker.x - 1, y);
      const rightChecker = this.hasChecker(checker.x + 1, y);

      return this.successCoordinates(rxa, ya) && rightChecker && rightChecker.color !== checker.color && !this.hasChecker(rxa, ya) ||
        this.successCoordinates(lxa, ya) && leftChecker && leftChecker.color !== checker.color && !this.hasChecker(lxa, ya);
    };

    if (checker.isKing) {
      return helper(-1) || helper(1);
    } else {
      const k = checker instanceof WhiteChecker ? -1 : 1;
      return helper(k);
    }
  }

  canMove(checker: Checker): boolean {
    return this.calcPossibleMoves(checker).length > 0;
  }

  resetSelect(): void {
    this.possibleMoves = [];
    this.selectedChecker = null;
  }

  deleteChecker(checker: Checker): void {
    const idx = this.checkers.indexOf(checker);
    this.checkers.splice(idx, 1);
  }

  nextStep(): void {
    this.currentPlay = this.currentPlay === WhiteChecker.color ? BlackChecker.color : WhiteChecker.color;
    this.avangard = [];

    let isGameOver = true;

    for (const c of this.checkers) {
      if (c.color !== this.currentPlay) {
        continue;
      }

      if (this.canMove(c)) {
        isGameOver = false;

        if (this.canAttack(c)) {
          this.avangard.push(c);
        }
      }
    }

    if (this.avangard.length === 1) {
      this.selectChecker(this.avangard[0]);
    }

    this.isGameOver = isGameOver;

    if (isGameOver) {
      this.winner = this.currentPlay === WhiteChecker.color ? BlackChecker.color : WhiteChecker.color;
    }
  }

  successCoordinates(x, y) {
    const isSuc = (i) => i >= 0 && i < BOARD_SIZE;
    return isSuc(x) && isSuc(y);
  }

  isInAvangard(checker: Checker) {
    return this.avangard.indexOf(checker) !== -1;
  }
}
