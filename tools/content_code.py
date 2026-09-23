# 코드 카드 새 설명 (data-id -> .ans 안쪽 HTML)
CARDS = {
# ---------------- C ----------------
"c1": """<span class="a">7 5 7</span>
<ol class="steps">
<li>처음: a = 5</li>
<li><code>b = a++;</code> → <b>먼저 b에 a를 넣고</b>(b = 5), 그다음 a를 1 올림(a = 6)</li>
<li><code>c = ++a;</code> → <b>먼저 a를 1 올리고</b>(a = 7), 그다음 c에 넣음(c = 7)</li>
<li>출력: a=7, b=5, c=7</li>
</ol>
<p class="why"><b>기억할 것</b>: ++가 <mark>뒤에 있으면 나중에</mark> 올리고, <mark>앞에 있으면 먼저</mark> 올린다. 기호 위치 = 올리는 시점.</p>""",

"c2": """<span class="a">30 12</span>
<ol class="steps">
<li><code>p = arr</code> → p는 배열 맨 앞(10이 있는 칸)을 가리킴</li>
<li><code>*(p+2)</code> → 괄호 먼저: 주소를 <b>2칸 뒤로 이동</b> → 30이 있는 칸 → 그 값 = <b>30</b></li>
<li><code>*p+2</code> → <code>*</code>가 먼저: 지금 칸의 값 10을 꺼냄 → 10 + 2 = <b>12</b></li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>괄호 안에 +가 있으면 칸 이동</mark>, 괄호가 없으면 값에 더하기. <code>*(p+i)</code>는 <code>arr[i]</code>와 같다.</p>""",

"c3": """<span class="a">20</span>
<ol class="steps">
<li><code>p = &amp;a</code> → p에는 <b>a의 주소</b>가 들어 있음 (p → a)</li>
<li><code>pp = &amp;p</code> → pp에는 <b>p의 주소</b>가 들어 있음 (pp → p → a)</li>
<li><code>*pp</code> = p, <code>**pp</code> = p가 가리키는 것 = <b>a</b></li>
<li><code>**pp = 20</code> → 결국 <b>a = 20</b></li>
</ol>
<p class="why"><b>기억할 것</b>: <code>&amp;</code>는 "주소 줘", <code>*</code>는 "그 주소로 한 번 가". <mark>*가 두 개면 두 번 따라간다</mark>. 화살표를 그려서 풀면 안 틀린다.</p>""",

"c4": """<span class="a">6</span>
<ol class="steps">
<li>배열 모양: 0행 = {1, 2, 3}, 1행 = {4, 5, 6}</li>
<li><code>a+1</code> → <b>1행</b>으로 이동</li>
<li><code>*(a+1)</code> → 1행의 맨 앞 칸 (4가 있는 곳)</li>
<li><code>*(a+1)+2</code> → 그 행에서 <b>2칸 오른쪽</b> (6이 있는 곳)</li>
<li>바깥 <code>*</code> → 값 꺼내기 = <b>6</b></li>
</ol>
<p class="why"><b>기억할 것</b>: <code>*(*(a+i)+j)</code> = <mark>a[i][j]</mark>. 안쪽 숫자는 행(몇 번째 줄), 바깥 숫자는 열(몇 번째 칸).</p>""",

"c5": """<span class="a">6 5</span>
<ol class="steps">
<li><code>"hello"</code>는 실제로 메모리에 <b>h e l l o \\0</b> 로 저장됨. 끝의 <code>\\0</code>은 "문자열 끝" 표시</li>
<li><code>sizeof(s)</code> → 배열이 차지하는 칸 수. \\0까지 셈 → <b>6</b></li>
<li><code>strlen(s)</code> → 글자 수. \\0 앞까지만 셈 → <b>5</b></li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>sizeof = 칸 수(끝 표시 포함), strlen = 글자 수</mark>. 차이는 항상 1.</p>""",

"c6": """<span class="a">123</span>
<ol class="steps">
<li>1번째 호출: n은 처음 한 번만 0으로 시작 → n++ → <b>1</b> 반환</li>
<li>2번째 호출: <code>static</code>이라 n = 1이 <b>그대로 남아 있음</b> → n++ → <b>2</b></li>
<li>3번째 호출: n = 2 → n++ → <b>3</b></li>
</ol>
<p class="why"><b>기억할 것</b>: 보통 지역변수는 함수가 끝나면 사라져서 매번 새로 시작한다(그러면 111). <mark>static은 함수가 끝나도 값을 기억</mark>하고, <code>= 0</code> 초기화는 맨 처음 한 번만 한다.</p>""",

"c7": """<span class="a">BC</span>
<ol class="steps">
<li>n = 2 → <code>case 2</code>로 들어감 → "B" 출력</li>
<li>case 2에 <code>break</code>가 없음 → 멈추지 않고 <b>바로 아래 case 3도 실행</b> → "C" 출력</li>
<li>case 3에 <code>break</code> 있음 → 여기서 switch 끝. default는 실행 안 됨</li>
</ol>
<p class="why"><b>기억할 것</b>: switch는 맞는 case에서 <mark>시작만</mark> 한다. 끝나는 건 break를 만났을 때뿐. break가 없으면 아래로 줄줄이 흘러내린다(fall-through).</p>""",

"c8": """<span class="a">3 1 -3 -1</span>
<ol class="steps">
<li><code>7/2</code> = 3.5 → 정수끼리 나누면 소수점 버림 → <b>3</b></li>
<li><code>7%3</code> = 7을 3으로 나눈 나머지 → 7 = 3×2 + <b>1</b></li>
<li><code>-7/2</code> = -3.5 → C는 <b>0 쪽으로 버림</b> → <b>-3</b> (-4 아님)</li>
<li><code>-7%3</code> → -7 = 3×(-2) + <b>-1</b>. 나머지 부호는 <b>앞 숫자(-7)를 따라감</b></li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>C·Java는 소수점을 그냥 잘라낸다</mark>. Python은 더 작은 쪽으로 내려서 -7//2 = -4가 된다. 언어마다 다르니 문제의 언어부터 확인.</p>""",

"c9": """<span class="a">1 7 6 8 -6</span>
<ol class="steps">
<li>먼저 2진수로 바꿈: 5 = <b>101</b>, 3 = <b>011</b></li>
<li><code>&amp;</code> (AND, 둘 다 1이면 1): 101 &amp; 011 = 001 = <b>1</b></li>
<li><code>|</code> (OR, 하나라도 1이면 1): 101 | 011 = 111 = <b>7</b></li>
<li><code>^</code> (XOR, 서로 다르면 1): 101 ^ 011 = 110 = <b>6</b></li>
<li><code>1&lt;&lt;3</code> (왼쪽으로 3칸 밀기 = ×2를 3번): 1 → 1000 = <b>8</b></li>
<li><code>~5</code> (모든 비트 뒤집기): 공식 <b>-(x+1)</b> → -(5+1) = <b>-6</b></li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>&lt;&lt; n은 ×2ⁿ, &gt;&gt; n은 ÷2ⁿ, ~x는 -(x+1)</mark>. 나머지는 2진수로 세로로 맞춰 놓고 한 자리씩 비교.</p>""",

"c10": """<span class="a">7</span>
<ol class="steps">
<li>s = {x: 3, y: 4}, p는 s를 가리킴</li>
<li><code>p-&gt;x</code>는 "p가 가리키는 구조체의 x" = s.x = 3</li>
<li><code>p-&gt;x = p-&gt;x + p-&gt;y</code> → s.x = 3 + 4 = <b>7</b></li>
<li>p를 통해 바꿨지만 결국 <b>s 자체</b>가 바뀐 것 → s.x = 7</li>
</ol>
<p class="why"><b>기억할 것</b>: 구조체 <b>변수</b>는 점(<code>s.x</code>), 구조체 <b>포인터</b>는 화살표(<code>p-&gt;x</code>). <mark>p-&gt;x = (*p).x</mark>.</p>""",

# ---------------- Java ----------------
"j1": """<span class="a">B</span>
<ol class="steps">
<li><code>A obj = new B();</code> → 변수 타입은 A, <b>실제로 만든 객체는 B</b></li>
<li>B가 show()를 <b>오버라이딩</b>(같은 모양으로 다시 정의)함</li>
<li>메서드를 부를 때는 <b>실제 객체(B)</b>의 것을 씀 → "B"</li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>메서드는 new 뒤를 본다</mark>. 겉포장(A)이 아니라 안에 든 물건(B)이 일한다. 이걸 동적 바인딩이라고 한다.</p>""",

"j2": """<span class="a">1</span>
<ol class="steps">
<li>A에도 x, B에도 x가 <b>각각 따로</b> 있음 (B 객체 안에 x가 두 개)</li>
<li>필드(변수)는 오버라이딩이 <b>안 됨</b></li>
<li>그래서 <b>변수 타입 A</b>를 보고 A의 x를 읽음 → 1</li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>메서드는 new 뒤(B), 필드는 앞쪽 타입(A)</mark>. 문제에서 <code>o.x</code>처럼 변수에 바로 점을 찍으면 선언 타입을 본다.</p>""",

"j3": """<span class="a">A</span>
<ol class="steps">
<li><code>static</code> 메서드는 객체가 아니라 <b>클래스에 붙어 있는</b> 메서드</li>
<li>그래서 오버라이딩이 안 되고, 자식 것은 그냥 이름만 같은 <b>별개 메서드</b>(숨김, hiding)</li>
<li><code>o.hi()</code> → o의 <b>선언 타입 A</b>의 hi()가 실행 → "A"</li>
</ol>
<p class="why"><b>기억할 것</b>: static은 "클래스 전용". <mark>static 메서드와 필드는 앞쪽 타입, 일반 메서드만 new 뒤</mark>. j1과 차이를 꼭 비교하기.</p>""",

"j4": """<span class="a">AB</span>
<ol class="steps">
<li><code>new B()</code> → B의 생성자 호출</li>
<li>B 생성자 첫 줄에는 눈에 안 보이는 <code>super();</code>가 자동으로 들어 있음</li>
<li>그래서 <b>A 생성자가 먼저</b> 실행 → "A"</li>
<li>다시 B 생성자로 돌아와 나머지 실행 → "B"</li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>부모가 먼저 태어나야 자식이 태어난다</mark>. 생성자 출력 순서는 항상 부모 → 자식.</p>""",

"j5": """<span class="a">12</span>
<ol class="steps">
<li><code>new B().f()</code> → B의 f() 실행</li>
<li>첫 줄 <code>super.f()</code> → <b>부모 A의 f()</b>를 부름 → "1"</li>
<li>B의 f()로 돌아와 다음 줄 → "2"</li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>super.메서드()는 "부모 버전 실행해 줘"</mark>. 오버라이딩해도 부모 것을 이렇게 따로 부를 수 있다.</p>""",

"j6": """<span class="a">3345</span>
<ol class="steps">
<li>+는 <b>왼쪽부터</b> 하나씩 계산</li>
<li><code>1 + 2</code> → 둘 다 숫자라 덧셈 → <b>3</b></li>
<li><code>3 + "3"</code> → 문자열이 끼면 <b>이어붙이기</b> → "33"</li>
<li><code>"33" + 4</code> → "334", <code>"334" + 5</code> → <b>"3345"</b></li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>문자열을 만나기 전까지는 덧셈, 만난 뒤로는 전부 붙이기</mark>. 만약 <code>"3" + 1 + 2</code>였다면 처음부터 문자열이라 "312".</p>""",

"j7": """<span class="a">true false true</span>
<ol class="steps">
<li><code>a = "hi"</code>, <code>b = "hi"</code> → 같은 글자를 따옴표로 쓰면 Java가 <b>하나를 만들어 같이 씀</b> → a와 b는 같은 객체 → <code>a==b</code> <b>true</b></li>
<li><code>c = new String("hi")</code> → new는 무조건 <b>새 객체</b> → <code>a==c</code> <b>false</b></li>
<li><code>a.equals(c)</code> → 글자 내용만 비교 → 둘 다 "hi" → <b>true</b></li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>== 는 "같은 물건이냐", equals는 "내용이 같냐"</mark>. 쌍둥이는 equals는 true, == 는 false.</p>""",

"j8": """<span class="a">3</span>
<ol class="steps">
<li><code>static int cnt</code>는 C 클래스 전체에 <b>딱 하나</b>만 있음</li>
<li>객체를 만들 때마다 생성자에서 cnt++ → 1, 2, 3</li>
<li>세 객체가 <b>같은 cnt 하나</b>를 올렸으므로 결과 3</li>
</ol>
<p class="why"><b>기억할 것</b>: 일반 변수는 객체마다 따로(각자 1), <mark>static 변수는 모두가 공유하는 한 개</mark>. 반 전체 출석부 같은 것.</p>""",

"j9": """<p><b>오버로딩 (Overloading)</b></p>
<ol class="steps">
<li>한 클래스 안에서 <b>이름이 같은 메서드를 여러 개</b> 만드는 것</li>
<li>조건: <mark>매개변수의 개수나 타입이 달라야 함</mark></li>
<li>반환형만 다르면 안 됨 (컴파일 에러)</li>
<li>예) <code>add(int a, int b)</code>, <code>add(double a, double b)</code></li>
</ol>
<p><b>오버라이딩 (Overriding)</b></p>
<ol class="steps">
<li>상속받은 <b>부모 메서드를 자식이 다시 정의</b>하는 것</li>
<li>조건: 이름, 매개변수, 반환형이 <mark>부모와 똑같아야 함</mark></li>
<li>예) 부모 <code>sound()</code> "..." → 자식 강아지 <code>sound()</code> "멍멍"</li>
</ol>
<p class="why"><b>외우는 법</b>: 로딩(loading) = 짐을 다르게 싣기(매개변수가 다름). 라이딩(riding) = 부모 위에 올라타 덮어쓰기.</p>""",

"j10": """<span class="a">BC</span>
<ol class="steps">
<li><code>10 / 0</code> → 0으로 나눔 → <b>ArithmeticException 발생</b></li>
<li>예외가 난 순간 try 블록의 <b>나머지 줄은 건너뜀</b> → "A"는 출력 안 됨</li>
<li>맞는 catch로 이동 → "B"</li>
<li><code>finally</code>는 예외가 나든 안 나든 <b>항상</b> 실행 → "C"</li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>예외 난 줄 아래는 스킵, finally는 무조건</mark>. 예외가 안 났다면 "AC".</p>""",

# ---------------- Python ----------------
"p1": """<span class="a">[2, 3] [4, 5] [1, 3, 5] [5, 4, 3, 2, 1]</span>
<ol class="steps">
<li>번호 매기기: 값 1 2 3 4 5 → 번호 <b>0 1 2 3 4</b> (뒤에서는 -5 -4 -3 -2 -1)</li>
<li><code>a[1:3]</code> → 1번부터 <b>3번 직전</b>까지 → 1번, 2번 → [2, 3]</li>
<li><code>a[-2:]</code> → 뒤에서 두 번째부터 끝까지 → [4, 5]</li>
<li><code>a[::2]</code> → 처음부터 끝까지 <b>2칸씩</b> 건너뛰기 → 0, 2, 4번 → [1, 3, 5]</li>
<li><code>a[::-1]</code> → 간격 -1 = <b>거꾸로</b> → [5, 4, 3, 2, 1]</li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>[시작 : 끝 : 간격], 끝 번호는 안 들어간다</mark>. 빈칸이면 "처음부터" 또는 "끝까지".</p>""",

"p2": """<span class="a">ell o He</span>
<ol class="steps">
<li>번호: H=0, e=1, l=2, l=3, o=4</li>
<li><code>s[1:4]</code> → 1, 2, 3번 → "ell"</li>
<li><code>s[-1]</code> → 맨 뒤 한 글자 → "o"</li>
<li><code>s[:2]</code> → 처음부터 2번 직전까지 → 0, 1번 → "He"</li>
</ol>
<p class="why"><b>기억할 것</b>: 문자열도 리스트와 똑같이 자른다. <mark>[:2]는 "앞에서 2글자"</mark>로 외우면 편하다.</p>""",

"p3": """<span class="a">3 -4 2 8 3.5</span>
<ol class="steps">
<li><code>7//2</code> → 3.5를 <b>내림</b> → 3</li>
<li><code>-7//2</code> → -3.5를 <b>내림(더 작은 쪽)</b> → <b>-4</b> (C는 -3)</li>
<li><code>-7%3</code> → Python 나머지는 <b>나누는 수(3)와 부호가 같음</b> → -7 = 3×(-3) + <b>2</b></li>
<li><code>2**3</code> → 2의 3제곱 → 8</li>
<li><code>7/2</code> → <code>/</code>는 항상 실수 → 3.5</li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>Python //는 무조건 아래로(바닥으로) 내린다</mark>. 음수가 나오면 C랑 답이 달라지니 함정 1순위.</p>""",

"p4": """<span class="a">[1, 2, 3, 4]</span>
<ol class="steps">
<li><code>a = [1, 2, 3]</code> → 리스트 하나를 만들고 a라는 이름표를 붙임</li>
<li><code>b = a</code> → 리스트를 <b>복사하지 않고</b> 같은 리스트에 b라는 이름표를 하나 더 붙임</li>
<li><code>b.append(4)</code> → 그 리스트 하나에 4 추가</li>
<li>a도 같은 리스트를 보고 있으니 → [1, 2, 3, 4]</li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>= 는 복사가 아니라 이름표 하나 더 붙이기</mark>. 따로 쓰려면 <code>b = a[:]</code> 또는 <code>b = a.copy()</code>.</p>""",

"p5": """<span class="a">[1, 2, [3, 4]] 3 [1, 2, 3, 4] 4</span>
<ol class="steps">
<li><code>a.append([3, 4])</code> → [3, 4] <b>리스트 통째로</b>를 한 칸에 넣음 → [1, 2, [3, 4]], 칸 수 3</li>
<li><code>b.extend([3, 4])</code> → 안의 값을 <b>하나씩 꺼내서</b> 넣음 → [1, 2, 3, 4], 칸 수 4</li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>append = 상자째 넣기, extend = 상자 풀어서 넣기</mark>.</p>""",

"p6": """<span class="a">[0, 1, 2, 3, 4] [1, 4, 7] [5, 3, 1]</span>
<ol class="steps">
<li><code>range(5)</code> → 0부터 5 직전까지 → 0~4</li>
<li><code>range(1, 10, 3)</code> → 1에서 시작, 3씩 증가, 10 직전까지 → 1, 4, 7 (10은 안 됨)</li>
<li><code>range(5, 0, -2)</code> → 5에서 시작, 2씩 감소, 0 직전까지 → 5, 3, 1</li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>range(시작, 끝, 간격)에서 끝은 절대 안 들어간다</mark>. 숫자를 직접 써 보면서 끝에 닿기 전에 멈추기.</p>""",

"p7": """<span class="a">[0, 4, 8]</span>
<ol class="steps">
<li>읽는 순서: <b>for → if → 앞의 식</b></li>
<li><code>for x in range(5)</code> → x = 0, 1, 2, 3, 4</li>
<li><code>if x % 2 == 0</code> → 짝수만 통과 → 0, 2, 4</li>
<li><code>x*2</code> → 0, 4, 8</li>
</ol>
<p class="why"><b>기억할 것</b>: 리스트 컴프리헨션은 <mark>가운데(for) → 오른쪽(if) → 왼쪽(식)</mark> 순서로 읽는다.</p>""",

"p8": """<span class="a">{2, 3} {1, 2, 3, 4} {1}</span>
<ol class="steps">
<li><code>a &amp; b</code> 교집합: 둘 다 있는 것 → {2, 3}</li>
<li><code>a | b</code> 합집합: 하나라도 있는 것 (중복은 한 번만) → {1, 2, 3, 4}</li>
<li><code>a - b</code> 차집합: a에만 있는 것 → {1}</li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>&amp; = 그리고(둘 다), | = 또는(하나라도), - = 빼기</mark>. set은 중복을 자동으로 없앤다.</p>""",

"p9": """<span class="a">1-2-3!A</span>
<ol class="steps">
<li><code>sep="-"</code> → 값과 값 <b>사이</b>에 "-"를 넣음 → 1-2-3</li>
<li><code>end="!"</code> → 끝에 원래 붙는 <b>줄바꿈 대신</b> "!"를 붙임 → 1-2-3!</li>
<li>줄이 안 바뀌었으니 다음 print("A")가 <b>바로 옆에</b> 이어짐 → 1-2-3!A</li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>sep = 사이에, end = 끝에</mark>. 기본값은 sep=" "(공백), end="\\n"(줄바꿈).</p>""",

"p10": """<span class="a">ab0</span>
<ol class="steps">
<li><code>for k in d</code> → dict를 그냥 돌리면 <b>키만</b> 나옴 → "a", "b"</li>
<li><code>end=""</code>라 줄바꿈 없이 붙음 → "ab"</li>
<li><code>d.get("c", 0)</code> → "c" 키가 없음 → 대신 <b>기본값 0</b> → "ab0"</li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>dict 반복 = 키만</mark>. 값은 <code>d.values()</code>, 둘 다는 <code>d.items()</code>. <code>d["c"]</code>처럼 없는 키를 바로 꺼내면 에러, get은 기본값.</p>""",

# ---------------- SQL ----------------
"s1": """<span class="a">3, 2</span>
<ol class="steps">
<li><code>COUNT(*)</code> → 행이 몇 줄인지 셈 → NULL이 있는 줄도 한 줄 → <b>3</b></li>
<li><code>COUNT(점수)</code> → 점수 칸에 <b>값이 있는 것만</b> 셈 → 90, 80 → <b>2</b></li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>*는 줄 수, 열 이름은 NULL 빼고</mark>. SUM, AVG, MAX, MIN도 NULL은 없는 셈 친다. 그래서 AVG(점수) = (90+80)/2 = 85.</p>""",

"s2": """<ol class="steps">
<li>SQL 실행 순서: <b>FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY</b></li>
<li><code>WHERE</code>는 GROUP BY <b>전</b>: 한 줄 한 줄을 거름 (예: 학년 = 3인 학생만)</li>
<li><code>HAVING</code>은 GROUP BY <b>후</b>: 묶인 그룹을 거름 (예: 학생 수가 10명 넘는 학과만)</li>
</ol>
<pre>SELECT 학과, COUNT(*) FROM 학생
WHERE 학년 = 3          -- 3학년만 남기고
GROUP BY 학과            -- 학과별로 묶고
HAVING COUNT(*) &gt; 10;   -- 10명 넘는 학과만</pre>
<p class="why"><b>기억할 것</b>: <mark>COUNT, AVG 같은 집계 함수 조건은 HAVING</mark>. WHERE에는 집계 함수를 못 쓴다.</p>""",

"s3": """<ol class="steps">
<li><code>%</code> = 글자 <b>0개 이상 아무거나</b></li>
<li><code>_</code> = 글자 <b>딱 1개</b></li>
<li><code>'김%'</code> → 김으로 시작 (김, 김철수, 김수한무 모두 OK)</li>
<li><code>'김_'</code> → 김 + 한 글자 = <b>두 글자</b>만 (김철 OK, 김철수 X)</li>
<li><code>'%김%'</code> → 어디든 김이 들어감 (박김수도 OK)</li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>% 는 몇 개든, _ 는 한 개</mark>. 밑줄 하나 = 빈칸 하나.</p>""",

"s4": """<ol class="steps">
<li><code>DELETE FROM 학생 WHERE ...</code> → <b>원하는 행만</b> 지움. 조건 없으면 전부. 테이블 틀은 남음. 롤백 가능 (DML)</li>
<li><code>TRUNCATE TABLE 학생</code> → <b>모든 행</b>을 한 번에 비움. 틀은 남음. 되돌릴 수 없음 (DDL)</li>
<li><code>DROP TABLE 학생</code> → <b>테이블 자체</b>를 없앰. 틀도 사라짐 (DDL)</li>
</ol>
<p class="why"><b>비유</b>: 서랍장에서 DELETE = 물건 골라서 버리기, TRUNCATE = 서랍 싹 비우기, DROP = <mark>서랍장을 통째로 버리기</mark>.</p>""",

"s5": """<ol class="steps">
<li><b>DDL</b> (Definition, 정의): 테이블 <b>틀</b>을 만들고 고치고 없앰 → <code>CREATE, ALTER, DROP, TRUNCATE</code></li>
<li><b>DML</b> (Manipulation, 조작): 틀 안의 <b>데이터</b>를 다룸 → <code>SELECT, INSERT, UPDATE, DELETE</code></li>
<li><b>DCL</b> (Control, 제어): <b>권한</b>과 확정·취소 → <code>GRANT, REVOKE, COMMIT, ROLLBACK</code></li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>틀 = DDL, 내용 = DML, 권한 = DCL</mark>. 헷갈리는 것: DELETE는 DML, DROP과 TRUNCATE는 DDL.</p>""",

"s6": """<ol class="steps">
<li><code>GRANT 권한 ON 테이블 TO 사용자</code> → 권한을 <b>준다</b> (~에게 = TO)</li>
<li><code>REVOKE 권한 ON 테이블 FROM 사용자</code> → 권한을 <b>뺏는다</b> (~에게서 = FROM)</li>
<li><code>WITH GRANT OPTION</code> → 받은 사람도 <b>다른 사람에게 권한을 줄 수 있음</b></li>
<li><code>CASCADE</code> → 뺏을 때, 그 사람이 남에게 나눠 준 권한까지 <b>줄줄이 같이</b> 회수</li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>주는 건 TO, 뺏는 건 FROM</mark>. 선물은 친구에게(to) 주고, 친구로부터(from) 돌려받는다.</p>""",

"s7": """<span class="a">둘 다 포함</span>
<ol class="steps">
<li><code>점수 BETWEEN 80 AND 90</code> = <code>점수 &gt;= 80 AND 점수 &lt;= 90</code></li>
<li>80점, 90점인 사람도 결과에 나옴</li>
<li><code>학년 IN (1, 3)</code> = <code>학년 = 1 OR 학년 = 3</code></li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>BETWEEN은 양 끝을 포함</mark>. Python range와 반대라 헷갈리기 쉽다.</p>""",

"s8": """<span class="a">ASC (오름차순)</span>
<ol class="steps">
<li><code>ORDER BY 점수</code> → 아무것도 안 쓰면 ASC → 작은 수부터 (60, 70, 80…)</li>
<li><code>ORDER BY 점수 DESC</code> → 큰 수부터 (100, 90, 80…)</li>
<li>여러 개: <code>ORDER BY 학년 ASC, 점수 DESC</code> → 학년 순으로 먼저, 같은 학년 안에서는 점수 높은 순</li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>ASC = Ascending(올라감), DESC = Descending(내려감)</mark>. 기본은 올라가는 쪽.</p>""",

# ---------------- DB 연습 ----------------
"d-q1": """<span class="a">차수 4, 카디널리티 5</span>
<ol class="steps">
<li>열(속성) 세기: 학번, 이름, 학과, 학년 → <b>4개 = 차수</b></li>
<li>행(튜플) 세기: 5명 → <b>5개 = 카디널리티</b></li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>차수 = 세로줄(열) 수, 카디널리티 = 가로줄(행) 수</mark>. 사람(카드)이 늘면 카디널리티가 는다.</p>""",

"d-q2": """<span class="a">개체 무결성</span>
<ol class="steps">
<li>학번은 이 테이블의 <b>기본키</b> (학생 한 명을 구별하는 값)</li>
<li>학번에 NULL을 넣으면 이 학생이 누군지 구별할 수 없음</li>
<li>기본키는 <b>NULL도 안 되고 중복도 안 됨</b> → 이 규칙이 개체 무결성</li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>기본키 문제 = 개체 무결성</mark>. 이름표 없는 학생은 입학 불가.</p>""",

"d-q3": """<span class="a">참조 무결성</span>
<ol class="steps">
<li>학생.학과는 학과 테이블을 <b>가리키는 외래키</b></li>
<li>학과 테이블에는 컴공, 전자만 있고 '경영'은 없음</li>
<li>없는 학과를 가리키면 안 됨 → 외래키 값은 <b>상대 테이블에 실제로 있는 값이거나 NULL</b>이어야 함</li>
</ol>
<p class="why"><b>기억할 것</b>: <mark>외래키 문제 = 참조 무결성</mark>. 존재하지 않는 반에 배정할 수 없다.</p>""",
}
