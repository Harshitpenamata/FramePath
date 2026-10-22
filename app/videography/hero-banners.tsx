// Home banners: the five designed banners as live HTML text over flat SVG drawings (from the designer's HTML/CSS,
// converted). The words are real text, so search engines and screen readers read them. Each banner's headline uses
// the tag it's given (h1 for the first banner, h2 for the rest). Class names carry an hb- prefix so they can't
// collide with the site's own; the styles are in home.css.
import React from 'react';

export type Banner=(H:React.ElementType)=>React.ReactNode;

export const banners:Banner[]=[
(H)=><>
<div className="hb-copy">
      <p className="hb-eyebrow">India’s first full-stack creative education platform.</p>
      <H className="hb-head">Your creative career,<br/>{' '}mapped by industry leaders.<br/>{' '}<span>Powered by AI.</span></H>
      <p className="hb-desc">From your first frame to your first film, beginner to advanced, all in one place.</p>
    </div>

    <svg className="hb-art" viewBox="1480 125 530 510" aria-hidden="true" focusable="false">
      <g className="hb-l hb-muted" strokeWidth="1.8">
        <path d="M1919 235V155H1545Q1521 155 1521 179V569Q1521 594 1545 594H1919V351"/>
        <path d="M1917 195H1593Q1569 195 1569 219V530Q1569 555 1593 555H1919"/>
        <path d="M1971 276V236H1655Q1631 236 1631 260V495Q1631 520 1655 520H1971V365"/>
      </g>
      <g className="hb-l hb-muted hb-dotted" strokeWidth="2">
        <path d="M1480 502H1569M1665 320H1856M1815 426H1856V320M1919 236V320"/>
      </g>
      <path className="hb-l hb-ink" strokeWidth="2.7"
        d="M1569 502H1660Q1704 502 1704 458V449Q1704 426 1727 426H1788Q1815 426 1815 399V351Q1815 320 1846 320H1971"/>
      <circle className="hb-f-muted" cx="1665" cy="320" r="5"/>
      <g className="hb-f-lime">
        <circle cx="1569" cy="502" r="7.5"/>
        <circle cx="1704" cy="429" r="7.5"/>
        <circle cx="1815" cy="424" r="7.5"/>
        <circle cx="1856" cy="320" r="7.5"/>
      </g>
      <path className="hb-l hb-lime" strokeWidth="7"
        d="M1939 320H2003M1971 288V352M1948 297L1994 343M1994 297L1948 343"/>
    </svg>

    <svg className="hb-frame" viewBox="0 0 2048 751" aria-hidden="true" focusable="false">
      <g className="hb-l hb-muted hb-faint" strokeWidth="1.4">
        <path d="M127 76H1921M127 676H1921M77 183V351M77 383V576M1477 76V302M1477 439V476M1477 514V676M1735 0V751M1024 46V106M1024 646V706M1480 320H1919"/>
      </g>
      <path className="hb-l hb-ink" strokeWidth="1.8"
        d="M58 76H100M79 55V97M1948 76H1990M1969 55V97M58 676H100M79 655V697M1948 676H1990M1969 655V697"/>
      <path className="hb-f-muted"
        d="M69 136h16v16H69Z M69 360h16v16H69Z M69 607h16v16H69Z M1964 152h16v16h-16Z M1964 607h16v16h-16Z M1469 490h16v16h-16Z"/>
      <path className="hb-l hb-muted hb-dotted" strokeWidth="3"
        d="M1815 104H1920M1788 649H1920"/>
      <path className="hb-f-lime"
        d="M130 579C215 558 348 550 430 553C458 554 477 556 472 560C459 565 421 571 420 575C420 586 547 569 624 567C688 565 757 569 820 574C737 572 673 573 620 576C537 579 443 593 418 584C409 580 411 572 427 569L449 562C370 558 232 571 134 587Z"/>
    </svg>
</>,
(H)=><>
<div className="hb-copy">
      <p className="hb-eyebrow">Curated by people who’ve done it.</p>
      <H className="hb-head">Most of our industry leaders<br/>{' '}<span>never went</span> to film school.</H>
      <p className="hb-desc">They learned from the internet and from great mentors.<br/>{' '}Now they’ve mapped the path for you.</p>
    </div>

    <svg className="hb-art" viewBox="1490 140 460 460" aria-hidden="true" focusable="false">
      <g className="hb-l hb-ink" strokeWidth="4">
        <path d="M1536 160H1797V412H1536Z"/>
        <path d="M1665 582V389H1697V374H1717V358H1763V335H1931V582Z"/>
      </g>
      <path className="hb-l hb-muted" strokeWidth="4" strokeDasharray="4 17"
        d="M1849 148V265M1578 430V540"/>
      <path className="hb-l hb-lime" strokeWidth="4" strokeLinecap="round"
        d="M1592 398C1650 324 1735 276 1800 275C1876 274 1890 325 1850 382C1810 441 1714 477 1646 464C1568 449 1603 386 1669 335"/>
      <path className="hb-l hb-lime" strokeWidth="2"
        d="M1593 399C1640 324 1725 279 1816 275"/>
      <rect className="hb-f-lime" x="1753" y="347" width="20" height="20"/>
      <rect className="hb-f-muted" x="1515" y="528" width="18" height="18"/>
    </svg>

    <svg className="hb-frame" viewBox="0 0 2048 751" aria-hidden="true" focusable="false">
      <path className="hb-l hb-muted hb-faint" strokeWidth="1.4"
        d="M605 108H1920M570 649H1723M385 0V127M1398 0V204M1399 508V751M73 334V551M0 512H98M1785 520H2048M1971 417V622"/>
      <path className="hb-l hb-muted" strokeWidth="1.8"
        d="M53 81H109M81 53V109M1941 81H1997M1969 53V109M53 669H109M81 641V697M1941 669H1997M1969 641V697"/>
      <path className="hb-f-muted"
        d="M158 108h14v14h-14Z M1392 102h12v12h-12Z M1394 643h12v12h-12Z M1939 144h14v14h-14Z"/>
      <path className="hb-l hb-muted" strokeWidth="4" strokeDasharray="4 17"
        d="M418 83H557M1753 650H1900"/>
    </svg>
</>,
(H)=><>
<div className="hb-copy">
      <p className="hb-eyebrow">Beginner to advanced.</p>
      <H className="hb-head"><span>700+</span> curated pathways.<br/>{' '}In every course.</H>
      <p className="hb-desc">From first steps to advanced craft, the whole climb is mapped.</p>
    </div>

    <svg className="hb-art" viewBox="1410 150 510 475" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="hb-depth-dots" width="18" height="18"
          patternUnits="userSpaceOnUse">
          <circle className="hb-f-muted" cx="3" cy="3" r="1.3"/>
        </pattern>
      </defs>
      <g className="hb-l hb-muted" strokeWidth="1.9">
        <path d="M1442 448H1735V597H1442Z"/>
        <path d="M1625 317H1806V394H1901V171H1713V352H1901"/>
        <path d="M1625 317V597M1735 352V597M1713 171H1901V394"/>
      </g>
      <path className="hb-l hb-muted hb-faint" strokeWidth="1"
        d="M1468 448V597M1532 448V597M1561 448V597M1591 448V597M1442 511H1735M1625 483H1735M1735 352V394M1790 171V394M1878 171V394M1790 203H1901"/>
      <g fill="url(#hb-depth-dots)">
        <rect x="1635" y="365" width="72" height="65"/>
        <rect x="1635" y="497" width="85" height="82"/>
        <rect x="1727" y="217" width="132" height="87"/>
      </g>
      <path className="hb-l hb-lime" strokeWidth="3.1"
        d="M1468 566H1518Q1560 566 1560 524V502Q1560 466 1596 466H1671Q1712 466 1712 425V378Q1712 342 1748 342H1788Q1823 342 1823 307V245Q1823 205 1863 205H1876"/>
      <path className="hb-l hb-lime" strokeWidth="2.8"
        d="M1847 247L1871 223M1847 223H1871V247"/>
      <path className="hb-f-lime"
        d="M1458 556h20v20h-20Z M1703 342h19v20h-19Z M1866 195h20v20h-20Z"/>
    </svg>

    <svg className="hb-frame" viewBox="0 0 2048 751" aria-hidden="true" focusable="false">
      <path className="hb-l hb-muted hb-faint" strokeWidth="1.4"
        d="M154 93H1894M154 663H1894M103 139V622M1945 139V622M1395 93V203M1395 555V663M1790 94V148M1879 545V713M1756 526H1996M57 437H128M1366 512H1420M1922 203H1970M1142 65V121M1145 637V703"/>
      <path className="hb-l hb-muted" strokeWidth="1.8"
        d="M78 93H128M103 68V118M1920 93H1970M1945 68V118M78 662H128M103 637V687M1920 662H1970M1945 637V687"/>
      <path className="hb-f-muted"
        d="M79 302h14v14H79Z M1956 386h14v14h-14Z M1956 409h14v14h-14Z"/>
      <path className="hb-l hb-muted hb-dotted" strokeWidth="2.5"
        d="M657 117H733M657 133H733M1503 115H1615M1475 641H1580M735 690H844"/>
      <path className="hb-f-lime"
        d="M128 387C217 367 337 363 423 367C445 367 458 370 448 373L410 383L439 371C363 372 280 379 217 388L256 376C206 379 166 385 128 390Z"/>
    </svg>
</>,
(H)=><>
<div className="hb-copy">
      <p className="hb-eyebrow">Your pathway is free.</p>
      <H className="hb-head">Know a little?<br/>{' '}Know a lot?<br/>{' '}<span>Start right there.</span></H>
      <p className="hb-desc">Share what you know and how far you’ve come. We map what comes next.</p>
    </div>

    <svg className="hb-art" viewBox="1260 175 700 380" aria-hidden="true" focusable="false">
      <path className="hb-l hb-muted hb-faint" strokeWidth="1.6"
        d="M1334 196V535M1604 247H1852V522H1703M1291 366H1350M1836 247H1852M1836 522H1868"/>
      <path className="hb-l hb-muted hb-dotted" strokeWidth="2.3"
        d="M1531 197H1690V522H1531Z"/>
      <g className="hb-f-muted">
        <rect x="1685" y="191" width="11" height="11"/>
        <rect x="1685" y="516" width="11" height="11"/>
        <circle cx="1531" cy="197" r="3"/>
        <circle cx="1531" cy="522" r="3"/>
      </g>
      <g className="hb-l hb-ink" strokeWidth="2.7">
        <path d="M1351 247H1555C1621 247 1611 346 1691 346H1713Q1740 346 1749 366"/>
        <path d="M1351 366H1749"/>
        <path d="M1351 482H1555C1621 482 1611 386 1691 386H1713Q1740 386 1749 366"/>
      </g>
      <circle className="hb-f-ink" cx="1334" cy="247" r="11"/>
      <circle className="hb-f-muted" cx="1334" cy="366" r="12"/>
      <g className="hb-f-lime">
        <circle cx="1334" cy="482" r="12"/>
        <circle cx="1749" cy="366" r="12"/>
      </g>
      <path className="hb-l hb-lime" strokeWidth="3.2"
        d="M1767 366H1941L1921 347M1941 366L1921 385"/>
      <path className="hb-l hb-lime" strokeWidth="3"
        d="M1281 252C1266 225 1352 196 1382 212C1414 229 1349 291 1299 277C1254 264 1303 214 1356 208C1403 202 1390 229 1380 242"/>
    </svg>

    <svg className="hb-frame" viewBox="0 0 2048 751" aria-hidden="true" focusable="false">
      <path className="hb-l hb-muted hb-faint" strokeWidth="1.4"
        d="M127 79H1919M127 666H1919M78 181V351M78 378V596M1334 87V207M1334 530V590M1690 550V713M1967 115V277M1967 310V550M1967 572V634M1024 49V109M1024 644V695"/>
      <path className="hb-l hb-ink" strokeWidth="1.8"
        d="M61 79H103M82 58V100M1946 79H1988M1967 58V100M61 667H103M82 646V688M1946 667H1988M1967 646V688"/>
      <path className="hb-f-muted"
        d="M70 137h16v16H70Z M70 355h16v16H70Z M70 606h16v16H70Z M1960 142h16v16h-16Z M1960 287h16v16h-16Z M1960 550h16v16h-16Z"/>
      <path className="hb-l hb-muted hb-dotted" strokeWidth="2.5"
        d="M1801 112H1915M1801 638H1915M1690 87V185"/>
      <path className="hb-f-lime"
        d="M130 579C232 560 365 554 469 559C507 560 528 564 519 570L467 582C517 585 612 568 693 569C755 568 824 574 871 580C800 576 736 576 682 579C605 583 479 598 448 588C429 581 441 575 481 569C375 565 237 578 135 586Z"/>
    </svg>
</>,
(H)=><>
<div className="hb-copy">
      <p className="hb-eyebrow">Learn your way.</p>
      <H className="hb-head">Learn with <span>AI.</span><br/>{' '}Or learn with a mentor.</H>
      <p className="hb-desc">Self-paced with AI-driven assignments and feedback, or a mentor-led program.</p>
    </div>

    <svg className="hb-art" viewBox="1280 150 640 480" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="hb-learning-dots" width="27" height="29"
          patternUnits="userSpaceOnUse" x="1346" y="208">
          <circle className="hb-f-ink" cx="2" cy="2" r="1.9"/>
        </pattern>
      </defs>
      <g className="hb-l hb-muted" strokeWidth="2.2">
        <path d="M1316 176H1627V355H1316Z"/>
        <path d="M1627 311H1894V513H1627Z"/>
      </g>
      <rect x="1344" y="206" width="250" height="127"
        fill="url(#hb-learning-dots)"/>
      <path className="hb-l hb-lime" strokeWidth="5" strokeLinecap="round"
        d="M1443 266C1514 265 1544 286 1555 333C1566 383 1587 397 1665 395"/>
      <g className="hb-bubbles" strokeWidth="3.4">
        <path d="M1682 351H1805Q1822 351 1822 368V416Q1822 433 1805 433H1698L1681 450V433Q1665 433 1665 416V368Q1665 351 1682 351Z"/>
        <path d="M1755 400H1849Q1865 400 1865 417V454Q1865 471 1849 471H1843V488L1823 471H1755Q1739 471 1739 454V417Q1739 400 1755 400Z"/>
      </g>
      <path className="hb-f-lime"
        d="M1468 601C1533 572 1608 544 1636 542C1668 538 1628 563 1605 578C1585 591 1567 604 1554 613C1632 581 1701 562 1769 561C1711 570 1643 583 1585 608C1559 619 1532 625 1546 607C1563 589 1603 565 1625 550C1581 561 1517 588 1470 607C1464 609 1462 604 1468 601Z"/>
    </svg>

    <svg className="hb-frame" viewBox="0 0 2048 751" aria-hidden="true" focusable="false">
      <path className="hb-l hb-muted hb-faint" strokeWidth="1.4"
        d="M515 113H1627M385 643H1518M86 181V269M86 315V520M1266 80V296M1266 586V678M1231 256H1316M1627 197H1849M1549 356V478M1766 261V311M1962 355V586M1894 471H1997"/>
      <path className="hb-l hb-ink" strokeWidth="1.8"
        d="M60 103H112M86 77V129M1936 103H1988M1962 77V129M60 643H112M86 617V669M1936 643H1988M1962 617V669"/>
      <path className="hb-l hb-muted" strokeWidth="1" d="M469 189H761"/>
      <path className="hb-f-muted"
        d="M79 283h17v17H79Z M79 552h17v17H79Z M1954 196h16v16h-16Z M1954 315h16v16h-16Z"/>
      <path className="hb-l hb-muted" strokeWidth="5" strokeDasharray="5 14"
        d="M286 115H471M158 643H338M1716 643H1900"/>
      <path className="hb-f-lime" d="M155 175h17v17h-17Z"/>
    </svg>
</>
];
