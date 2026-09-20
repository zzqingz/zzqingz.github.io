/* 本地课件演示：所有数据预编排，所有状态可回退。无第三方依赖。 */
(() => {
  'use strict';
  const copy = x => JSON.parse(JSON.stringify(x));
  const $ = id => document.getElementById(id);
  const esc = x => String(x).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const C = {teal:'#087e83', pale:'#e5f5f2', ink:'#172b38', muted:'#637380', line:'#d6e1e6', amber:'#d78726', red:'#c85353', blue:'#477ec2'};
  const modules = [];
  function chapter(id, title, subtitle, source, initial, note, question) {
    const m = {id,title,subtitle,source,initial:copy(initial),intro:{title:note,text:subtitle,question},segments:[]};
    modules.push(m); return m;
  }
  function segment(m, label, title, text, question, frames, takeaway='') {
    m.segments.push({label,title,text,question,takeaway,frames});
  }
  function shot(s, caption, hold=850) {return {state:copy(s),caption,hold};}

  // 01 · 数组地址
  {
    const s={kind:'address',reached:5,answer:false};
    const m=chapter('address','顺序表 · 数组地址','A[5] 的地址是 1032，每个元素占 4 个存储单元。A[0] 在哪里？','主课件 12、16–18 页',s,'第 6 个元素，隔了几格？','A[5] 与 A[0] 之间，是 5 个间隔还是 6 个？');
    const frames=[];
    for(let i=4;i>=0;i--){s.reached=i;frames.push(shot(s,`向左退 ${5-i} 个间隔：1032 − ${5-i} × 4 = ${1012+i*4}`));}
    segment(m,'沿地址向左走','数间隔，不数格子','下标从 0 开始。A[5] 是第 6 项，但它距离 A[0] 只有 5 个间隔。','每向左一格，地址减少多少？',frames);
    s.answer=true;
    segment(m,'揭示答案与回代','首地址是 1012','1032 − 5 × 4 = 1012。再从首地址走 5 个间隔，正好回到 1032。','如果题目改成“第 5 项”，还需要走 5 个间隔吗？',[shot(s,'A[0] = 1012；回代：1012 + 5 × 4 = 1032。')],'下标从 0 起；位序从 1 起。');
  }

  // 02 · 栈与队列
  {
    const s={kind:'compare',input:['A','B','C'],stack:[],queue:[],outS:[],outQ:[],phase:0,summary:true};
    const m=chapter('compare','栈与队列 · 基本操作','栈只在栈顶进出；队列从队尾进入，从队头离开。','主课件 21–23、31–32 页',s,'先比较操作位置与顺序规则','栈和队列分别从哪里进入、从哪里离开？');
    s.summary=false;
    const f=[shot(s,'接下来用 A、B、C 演示栈与队列的进出过程。',600)];
    for(const v of ['A','B','C']){s.input.shift();s.stack.push(v);s.queue.push(v);f.push(shot(s,`${v} 进入：栈在栈顶添加；队列在队尾添加。`));}
    for(let i=0;i<3;i++){const a=s.stack.pop(),b=s.queue.shift();s.outS.push(a);s.outQ.push(b);f.push(shot(s,`本次取出：栈 → ${a}；队列 → ${b}。`));}
    segment(m,'全部进入后取出','栈后进先出，队列先进先出','盘子从上面取；打印任务按到达顺序处理。同样的输入，操作位置决定了输出。','这次栈的输出为什么恰好是输入的倒序？',f,'栈：C B A　｜　队列：A B C');
    Object.assign(s,{input:['A','B','C'],stack:[],outS:[],phase:1});
    const g=[shot(s,'重置左侧的栈；右侧保留 FIFO 的输出作对照。',600)];
    for(const [op,v] of [['push','A'],['pop','A'],['push','B'],['push','C'],['pop','C'],['pop','B']]){
      if(op==='push'){s.input.shift();s.stack.push(v);}else{s.outS.push(s.stack.pop());}
      g.push(shot(s,`${op==='push'?'入栈':'出栈'} ${v}：${op==='push'?'放到栈顶':'只取当前栈顶'}。`));
    }
    segment(m,'交替入栈与出栈','后进先出 ≠ 永远整体倒序','A 可以在 B、C 进入前先出栈；之后 C 仍比 B 先出。每一步都遵守栈顶进出。','输出 A、C、B 是否违反后进先出？',g,'整体倒序的前提：全部入栈后，再全部出栈。');

  }

  function stackTrace(target) {
    const s={kind:'legal',input:['A','B','C','D','E'],stack:[],output:[],target:[...target],blocked:false,option:target==='ADBCE'?'A':target==='ACBDE'?'B':target==='CBADE'?'C':'D'};
    const f=[];
    for(const want of target){
      while(s.stack.at(-1)!==want && s.input.length){const v=s.input.shift();s.stack.push(v);f.push(shot(s,`入栈 ${v}，当前希望输出 ${want}。`));}
      if(s.stack.at(-1)!==want){s.blocked=true;f.push(shot(s,`栈顶 ${s.stack.at(-1)} 挡住 ${want}，无法继续。`));break;}
      s.output.push(s.stack.pop());f.push(shot(s,`出栈 ${want}，它正好位于栈顶。`));
    }
    return f;
  }
  // 03 · 合法出栈
  {
    const s={kind:'legal',input:['A','B','C','D','E'],stack:[],output:[],target:[...'ADBCE'],blocked:false,option:'A'};
    const m=chapter('legal','栈 · 出栈顺序','入栈顺序为 A B C D E，哪种出栈顺序不可能？','主课件 22–23、28 页',s,'先试选项 A：A D B C E','输出 A、D 之后，下一步能直接取 B 吗？');
    const f=[];
    for(const [op,v] of [['push','A'],['pop','A'],['push','B'],['push','C'],['push','D'],['pop','D']]){
      if(op==='push'){s.input.shift();s.stack.push(v);}else{s.output.push(s.stack.pop());}
      f.push(shot(s,`${op==='push'?'入栈':'出栈'} ${v}。${v==='D'&&op==='pop'?'下一项要求 B。':''}`));
    }
    segment(m,'执行到输出 A、D','现在，栈顶是谁？','为了先输出 D，B、C 必须已经入栈。D 离开后，C 留在 B 的上面。','不移走 C，能否取出 B？',f);
    s.blocked=true;
    segment(m,'揭示阻挡位置','C 挡住 B，选项 A 不可能','目标要求先 B 后 C，但栈只允许从顶端取出。即使再入 E，也不能绕过 C。','如果先弹出 C，还能满足目标序列吗？',[shot(s,'无法输出 B：栈顶是 C。只需找到第一个做不到的位置。')],'答案 A；不是因为“不像倒序”，而是这一步不合法。');
    segment(m,'播放合法选项 B','A C B D E 可以实现','每次希望取出的元素都能到达栈顶。入栈与出栈可以交替，入栈相对顺序始终不变。','这段过程是否仍按 A、B、C、D、E 入栈？',stackTrace('ACBDE'),'入栈顺序不变；入栈与出栈可以交替。');
    m.backups={C:stackTrace('CBADE'),D:stackTrace('CBAED')};
  }

  // 04 · 容量峰值
  {
    const init=cap=>({kind:'capacity',input:[...'abcdefg'],stack:[],queue:[],output:[],cap,peak:0,blocked:false,summary:false});
    const s=init(3);
    const m=chapter('capacity','栈与队列 · 最小栈容量','出栈后立即入队；出队顺序要求 b d c f e a g。栈至少需要几格？','主课件 22–23、31 页',s,'7 个元素，不一定要 7 格','要输出 d 的那一刻，哪些元素还不能出栈？');
    function push(v,f){if(s.input.shift()!==v)throw Error('容量题输入顺序错误');s.stack.push(v);s.peak=Math.max(s.peak,s.stack.length);f.push(shot(s,`入栈 ${v}；当前占用 ${s.stack.length}，历史峰值 ${s.peak}。`,650));}
    function pop(f){const v=s.stack.pop();s.queue.push(v);f.push(shot(s,`${v} 出栈后立即入队；队列保持进入顺序。`,650));}
    const g=[];push('a',g);push('b',g);pop(g);push('c',g);push('d',g);
    segment(m,'演示容量 3','峰值 3，恰好装下 a、c、d','现在 d 位于栈顶，可以按要求输出；a、c 保留在栈里等候。','三个元素中，下一个应该是谁离开？',g,'至少需要 3 格。');
    const h=[];pop(h);pop(h);push('e',h);push('f',h);pop(h);pop(h);pop(h);push('g',h);pop(h);
    while(s.queue.length){const v=s.queue.shift();s.output.push(v);h.push(shot(s,`${v} 从队头离开，FIFO 不改变顺序。`,450));}
    segment(m,'完成其余过程','3 格足以走完整个流程','每个元素出栈后立即入队。最后按 FIFO 依次出队，得到 b、d、c、f、e、a、g。','后续有没有哪一刻超过 3 格？',h,'整个过程的栈占用峰值为 3。');
    s.summary=true;
    segment(m,'得出最小容量','占用峰值为 3，最小容量是 3','“至少 3”由 a、c、d 同时存在说明；“3 就够”由完整可行过程说明。两部分合起来得到最小值。','只演示 3 格成功，能否单独证明它最小？',[shot(s,'选 C（3）。元素总数不等于同时占用的最大数量。')],'容量 = 需要同时保存的元素数的最大值。');
  }

  // 05 · 多盘汉诺塔：从真实递归调用生成轨迹，不写死移动顺序。
  function createHanoi(count){
    const s={kind:'hanoi',count,pegs:[Array.from({length:count},(_,i)=>count-i),[],[]],moves:0,active:0,from:0,to:2,flight:false,log:[],calls:[],view:'intro',rootPart:-1,event:'intro'};
    const m={id:'hanoi',title:'汉诺塔 · 递归与调用栈',subtitle:`${count} 个圆盘从 X 移到 Z：一次一个，只拿顶部，大盘不能压小盘。`,source:'主课件 29–30 页 · 递归',initial:copy(s),intro:{title:`搬 ${count} 个盘，先搬上面的 ${count-1} 个`,text:'把上面的小盘看成一个子任务。关键不是记住移动顺序，而是明确每次调用的源柱、目标柱和辅助柱。',question:'最大盘从 X 到 Z 之前，其余圆盘必须先在哪里？'},segments:[]};
    s.view='relation';
    segment(m,'拆解递归关系',`搬 ${count} 个 = 搬 ${count-1} 个 + 搬 1 个 + 搬 ${count-1} 个`,'H(n, 源, 目标, 辅助)：① 把上面 n−1 个从源移到辅助；② 把最大盘从源移到目标；③ 把 n−1 个从辅助移到目标。','子任务中的“目标柱”一定还是 Z 吗？',[shot(s,'柱子 X、Y、Z 不变，但“源 / 目标 / 辅助”的角色随调用改变。')],'n = 1 时直接移动，随后返回。');
    const trace=[];s.view='trace';
    const name=(n,a,b,c)=>`H(${n}, ${'XYZ'[a]}, ${'XYZ'[b]}, ${'XYZ'[c]})`;
    function emit(event,caption,hold=160){s.event=event;const root=s.calls[0];s.rootPart=root?(root.line<=3?0:root.line===4?1:2):s.moves?3:-1;trace.push(shot(s,caption,hold));}
    function move(a,b){const disk=s.pegs[a].at(-1);if(!disk||(s.pegs[b].length&&s.pegs[b].at(-1)<disk))throw Error('汉诺塔非法移动');s.active=disk;s.from=a;s.to=b;s.flight='lift';emit('lift',`只拿顶部：拿起盘 ${disk}。`,240);s.flight='across';emit('across',`盘 ${disk}：${'XYZ'[a]} → ${'XYZ'[b]}。`,300);s.pegs[a].pop();s.pegs[b].push(disk);s.flight=false;s.moves++;s.log.push(`${disk}:${'XYZ'[a]}→${'XYZ'[b]}`);emit('move',`第 ${s.moves} 次移动：盘 ${disk} 从 ${'XYZ'[a]} 到 ${'XYZ'[b]}。`,340);}
    function solve(n,a,b,c){
      const call={n,a,b,c,line:1};s.calls.push(call);emit('enter',`进入 ${name(n,a,b,c)}：源 ${'XYZ'[a]}，目标 ${'XYZ'[b]}，辅助 ${'XYZ'[c]}。`,s.moves===0?550:160);
      if(n===1){call.line=2;emit('base','只剩 1 个盘：直接移动，不再递归。',260);move(a,b);}
      else{call.line=3;emit('call',`先完成 ${name(n-1,a,c,b)}；当前任务在这里等待。`);solve(n-1,a,c,b);call.line=4;emit('resume',`子任务完成，回到 ${name(n,a,b,c)}：接着移动盘 ${n}。`,350);move(a,b);call.line=5;emit('call',`再完成 ${name(n-1,c,b,a)}；辅助柱变成子任务的源柱。`);solve(n-1,c,b,a);}
      s.calls.pop();s.active=0;emit('return',`${name(n,a,b,c)} 完成，${s.calls.length?'返回调用它的上一层。':'全部圆盘到达 Z。'}`,230);
    }
    solve(count,0,2,1);
    const firstLeaf=trace.findIndex(f=>f.state.event==='enter'&&f.state.calls.at(-1)?.n===1);
    const firstResume=trace.findIndex(f=>f.state.event==='resume'&&f.state.moves===1);
    const half=2**(count-1)-1;
    const beforeLargest=trace.findIndex(f=>f.state.event==='resume'&&f.state.moves===half&&f.state.calls.length===1);
    const afterLargest=trace.findIndex(f=>f.state.event==='move'&&f.state.moves===half+1);
    segment(m,'展开到最小任务',`${count} → ${count-1} → … → 1`,'调用新的 H 时，把它压入调用栈；父任务暂时等待。右边最下面的高亮行是当前执行的任务。注意每一层的目标柱和辅助柱都会交换。','为什么一定能走到 n = 1？',trace.slice(0,firstLeaf+1),'每递归一次，n 减少 1；此时尚未移动任何圆盘。');
    segment(m,'移动一盘，再返回','返回上一层，接着做下一件事','n = 1 直接移动一个盘，然后这一层出栈。回到 H(2, …) 后，继续移动它的较大盘，不会从父任务开头重来。','栈顶弹出后，谁成为当前任务？',trace.slice(firstLeaf+1,firstResume+1),'递归有“深入”，也有“返回并继续”。');
    segment(m,`完成前 ${count-1} 个盘的子任务`,`上面的 ${count-1} 个盘全部移到 Y`,'继续相同的递归规则：小任务完成就返回，父任务从等待的位置继续。直到整个第一个子任务完成，才轮到原问题的最大盘。',`此时 X 上还剩哪个盘？`,trace.slice(firstResume+1,beforeLargest+1),`先完成 ${half} 次移动；顶层任务仍未结束。`);
    segment(m,'移动最大盘',`第 ${half+1} 次：移动盘 ${count}`,'现在小盘都在 Y，Z 为空。最大盘可以直接从 X 移到 Z。下一步，Y 成为源柱，Z 为目标柱，X 为辅助柱。','为什么下一次递归调用的三个柱子顺序变了？',trace.slice(beforeLargest+1,afterLargest+1),'柱子的名字不变，任务中的角色改变。');
    segment(m,`完成后 ${count-1} 个盘的子任务`,'再做一次同类子问题','把 Y 上的 n−1 个盘搬到 Z，仍然调用同一个 H，只是参数改变。最后顶层调用也返回，调用栈清空。','为什么同一个函数能处理不同的柱子和盘数？',trace.slice(afterLargest+1),`总计 ${2**count-1} 次移动，所有圆盘到达 Z。`);
    s.view='recurrence';s.active=0;
    segment(m,'归纳递归关系','T(n) = 2T(n−1) + 1','前后两个子任务各移动 n−1 个盘，中间移动一次最大盘。边界 T(1)=1，因此 T(2)=3、T(3)=7、T(4)=15，依次得到 T(n)=2ⁿ−1。','从 5 个盘增加到 6 个盘，为什么是 31 + 1 + 31？',[shot(s,`${count} 盘：${half} + 1 + ${half} = ${2**count-1} 次。每次移动最大盘，都要先清空上方的小盘。`)],'递归关系：两个更小的同类问题，加一次直接移动。');
    return m;
  }
  modules.push(createHanoi(5));

  // 06 · Q8 插入
  const inputHeap=[4,2,5,8,3,6,10,1];
  {
    const s={kind:'heap',heap:[],pending:inputHeap.slice(),focus:[],snapshots:[],valid:true,inserted:null,mode:'insert'};
    const m=chapter('heap','二叉堆 · 插入与上浮','按 4、2、5、8、3、6、10、1 的顺序，构建最小二叉堆。','主课件 38–39 页',s,'先放对位置，再比较父结点','新元素能直接放在你觉得合适的位置吗？');
    function insert(v,f){
      if(s.pending.shift()!==v)throw Error('堆输入顺序错误');s.heap.push(v);s.inserted=v;let i=s.heap.length-1;s.focus=[i];s.valid=i===0||s.heap[Math.floor((i-1)/2)]<=v;
      f.push(shot(s,`插入 ${v}：放到按层从左到右的下一个空位。`));
      while(i>0){const p=Math.floor((i-1)/2);s.focus=[p,i];f.push(shot(s,`比较 ${s.heap[i]} 与父结点 ${s.heap[p]}。`,700));if(s.heap[i]>=s.heap[p]){f.push(shot(s,`${s.heap[i]} ≥ ${s.heap[p]}，不需要交换，停止。`,650));break;}const parent=s.heap[p];[s.heap[i],s.heap[p]]=[s.heap[p],s.heap[i]];s.focus=[p,i];s.valid=false;f.push(shot(s,`${v} < ${parent}，交换，上浮一层。`));i=p;}
      s.valid=true;s.focus=[i];s.snapshots.push({value:v,heap:s.heap.slice()});f.push(shot(s,`插入 ${v} 完成；本轮结果已保存。`,850));
    }
    const groups=[[4,2,5],[8],[3],[6,10],[1]];
    const titles=['前三次插入，先看基本动作','插入 8，不必交换','插入 3，只和父结点比较','6 和 10 留在新位置','插入 1，连续上浮三层'];
    const texts=['2 比 4 小，交换后成为根；5 不小于父结点 2，留在原位。','8 放到第四个位置，父结点为 4。8 ≥ 4，直接停止。','3 与父结点 4 交换，再与 2 比较。3 ≥ 2，到此停止。','6、10 的父结点都是 5，它们均不小于 5，因此不需要上浮。','1 依次与 8、3、2 交换，最后到根。调整只沿新结点到根的一条路径进行。'];
    groups.forEach((group,k)=>{const f=[];group.forEach(v=>insert(v,f));segment(m,`插入 ${group.join('、')}`,titles[k],texts[k],k===4?'1 需要经过哪些父结点，才能到根？':'如果当前元素已经不小于父结点，还需要向上走吗？',f,k===4?'八轮完成。下方保留每轮调整后的树形快照。':'按层填空位；父值不大于孩子。');});
  }

  // 07 · 删除
  {
    const s={kind:'heap',heap:[1,2,5,3,4,6,10,8],pending:[],focus:[0],snapshots:[],valid:true,mode:'delete',removed:null};
    const m=chapter('delete','二叉堆 · 删除与下沉','在刚才建好的堆上，删除一次最小值。','主课件 40 页 · 衔接练习',s,'最小值在根，但不能留下空位','最后一个结点移到根后，形状和大小关系各会怎样？');
    s.removed=1;s.heap[0]=null;s.valid=false;const f=[shot(s,'取出根 1；用最后一个结点 8 补位。')];s.heap[0]=s.heap.pop();s.focus=[0];f.push(shot(s,'8 补到根，末尾位置删除。完全形状保住了，堆序还需要调整。'));
    segment(m,'取最小值，末尾补根','先保住完全形状','取走 1 后，把末尾的 8 放到根。若随意拿其他结点补位，可能在中间留下空洞。','根的两个孩子是 2、5，应该和谁交换？',f);
    s.focus=[0,1,2];const g=[shot(s,'比较两个孩子 2、5，选择较小的 2。')];[s.heap[0],s.heap[1]]=[s.heap[1],s.heap[0]];s.focus=[0,1];g.push(shot(s,'8 与 2 交换，向下走一层。'));
    segment(m,'与较小孩子 2 交换','必须选择较小的孩子','换 2 上来，才能让新父结点不大于另一个孩子 5。只挑任意孩子交换并不可靠。','如果把 5 换上来，它与孩子 2 的关系还正确吗？',g);
    s.focus=[1,3,4];const h=[shot(s,'继续比较 8 的两个孩子 3、4，选择 3。')];[s.heap[1],s.heap[3]]=[s.heap[3],s.heap[1]];s.focus=[1,3];h.push(shot(s,'8 与 3 交换，继续向下走一层。'));
    segment(m,'继续与 3 交换','沿同一条路径继续向下','每次只处理当前位置与孩子的关系，其他分支无需移动。','8 到达叶结点后，还需要继续吗？',h);
    s.focus=[3];s.valid=true;
    segment(m,'停止并检查结果','到叶结点，调整结束','最终层序为 2、3、5、8、4、6、10。形状仍完全，父结点的值也都不大于孩子。','还有一种停止情况：当前值已经不大于孩子，对吗？',[shot(s,'删除最小值 1 完成。只走了根 → 2 原位置 → 3 原位置这条路径。')],'有两个孩子选较小者；只有一个孩子就只比较它。');
  }

  // 08 · log n
  {
    const s={kind:'growth',phase:0,n:8,height:3,heap:[1,2,5,3,4,6,10,8],focus:[]};
    const m=chapter('growth','二叉堆 · O(log n) 的意义','一百万个元素，也只沿约二十层调整。','二叉堆的高度与单次操作',s,'刚才，我们遍历整个堆了吗？','插入 1 时，右边那些结点参与交换了吗？');
    s.phase=1;s.heap=[2,3,5,8,4,6,10,1];s.focus=[7];const f=[shot(s,'回到插入 1、尚未上浮的时刻。')];let child=7;for(const i of [3,1,0]){const parent=s.heap[i];[s.heap[child],s.heap[i]]=[s.heap[i],s.heap[child]];s.focus.push(i);f.push(shot(s,`回看上浮路径：1 与 ${parent} 交换；只沿一条父子路径。`));child=i;}
    segment(m,'回看一条调整路径','调整只走一条路','插入 1 时先后与 8、3、2 交换。其他分支保持原状，每一层只做固定数量的比较与可能的交换。','数据总量和这条路径的长度，是同一个数量吗？',f);
    s.phase=2;
    segment(m,'展开每一层的容量','每多一层，能放的结点翻倍','每层最多有 1、2、4、8……个结点。完全二叉树按层填满，少数几层就能容纳很多元素。','第一层 1 个，下一层最多几个？',[shot(s,'每层容量：1 → 2 → 4 → 8 → 16。高度按边数计算，根的深度为 0。')]);
    s.phase=3;s.n=7;s.height=2;
    segment(m,'看 7 个元素','7 个元素，高度是 2','1 + 2 + 4 = 7。根到最底层只跨 2 条父子边，调整路径最多跨这么多层。','为什么是高度 2，而不是 3？',[shot(s,'3 层结点之间只有 2 条边；这里高度按边数计算。')]);
    s.phase=4;s.n=15;s.height=3;const g=[shot(s,'15 个元素，高度 3：元素约翻倍，只多一层。',1300)];s.n=31;s.height=4;g.push(shot(s,'31 个元素，高度 4：再约翻倍，又只多一层。',1300));
    segment(m,'从 15 扩展到 31','元素约翻倍，高度只加一','7 → 15 → 31，元素数量越来越大，调整路径却只从 2 → 3 → 4。','如果元素数量翻倍，调整工作量也必须翻倍吗？',g,'增长慢的是调整路径长度，不是存储元素的数量。');
    s.phase=5;s.n=1023;s.height=9;const h=[shot(s,'1,023 个元素，高度 9。',1400)];s.n=1048575;s.height=19;h.push(shot(s,'1,048,575 个元素，高度 19：规模约一百万，路径约二十层。',1600));
    segment(m,'跳到百万规模','一百万个元素，约二十层','高度从 9 到 19，只多 10 层，能装下的元素却从约一千变成约一百万。图中大树只画层次示意。','19 层调整，是否等于恰好比较 19 次？',h,'层数不是精确比较次数；每层可能有多次比较。');
    s.phase=6;
    segment(m,'揭示 log n','log₂ n：不断减半到约 1','反过来想：从一百万连续减半，大约二十次就到 1。树高 h = ⌊log₂ n⌋（n ≥ 1），每层工作量有固定上界。','log n 描述的是秒数，还是随规模增长的方式？',[shot(s,'一条路径 × 每层固定工作量 ⇒ 单次插入、删除最小值，最坏 O(log n)。')],'插入按加入新结点后的高度看；删除按移走末尾后的高度看。');
    s.phase=7;
    segment(m,'总结操作的增长方式','数量翻倍，最坏路径约多一层','插入与删除最小值：最坏 O(log n)。只读取最小值：直接看根，O(1)。操作可能提前停止，不保证每次走满树高。','只读取最小值，为什么无需向下走？',[shot(s,'讨论单次堆调整，默认数组容量足够、键值比较成本固定，不计偶发扩容。')],'O(log n) 不是“固定比较 log n 次”，也不是运行秒数。');
  }

  // SVG 绘图：元素带稳定标识，以便在新旧位置间移动。
  let tokens=[], body='';
  const txt=(x,y,t,size=18,color=C.ink,anchor='start',weight=400)=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-weight="${weight}">${esc(t)}</text>`;
  const rect=(x,y,w,h,fill='#fff',stroke=C.line,r=12)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
  const line=(x1,y1,x2,y2,color=C.line,width=2,dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
  function token(key,x,y,value,color=C.teal,w=48,h=42,circle=false){tokens.push({key,x,y,markup:circle?`<circle r="${w/2}" fill="${color}" stroke="white" stroke-width="3"/>${txt(0,7,value,22,'white','middle',600)}`:`${rect(-w/2,-h/2,w,h,color,color,8)}${txt(0,7,value,20,'white','middle',600)}`});}
  function row(values,x,y,prefix,color=C.teal,gap=54){values.forEach((v,i)=>token(prefix+v,x+i*gap,y,v,color));}
  function rowSlots(n,x,y,gap=54){for(let i=0;i<n;i++)body+=rect(x+i*gap-24,y-21,48,42,'#f6f8fa','#e2e8ec',8);}
  function label(x,y,t){body+=txt(x,y,t,14,C.muted);}
  function stack(values,x,bottom,cap,prefix,blocked=false){
    const height=cap*48+12;body+=`<path d="M ${x-43} ${bottom-height} V ${bottom+6} H ${x+43} V ${bottom-height}" fill="none" stroke="${blocked?C.red:C.line}" stroke-width="3"/>`;
    for(let i=0;i<cap;i++)body+=rect(x-32,bottom-i*48-40,64,38,'#f6f8fa','#e3e9ed',7);
    values.forEach((v,i)=>token(prefix+v,x,bottom-i*48-21,v,blocked&&i===values.length-1?C.red:C.teal,64,38));
    body+=txt(x+57,bottom-Math.max(values.length-1,0)*48-15,'← 栈顶',14,blocked?C.red:C.teal);body+=txt(x,bottom+29,'栈底',12,C.muted,'middle');
  }
  function arrow(x1,y1,x2,y2,color=C.muted){const d=x2>=x1?1:-1;body+=line(x1,y1,x2,y2,color,2);body+=`<path d="M ${x2-8*d} ${y2-5} L ${x2} ${y2} L ${x2-8*d} ${y2+5}" fill="none" stroke="${color}" stroke-width="2"/>`;}
  function badge(x,y,text,color=C.teal,w=180){body+=rect(x,y,w,34,color===C.red?'#fbeded':C.pale,'none',8)+txt(x+w/2,y+23,text,14,color,'middle',600);}
  function heapXY(i,compact=false){const l=Math.floor(Math.log2(i+1)),pos=i-(2**l-1);return{x:70+(pos+.5)*780/(2**l),y:compact?68+l*57:88+l*77};}
  function tree(s,small=false){
    const a=s.heap,compact=s.kind==='heap';
    for(let i=1;i<a.length;i++){const p=Math.floor((i-1)/2),u=heapXY(p,compact),v=heapXY(i,compact);const hot=s.focus?.includes(i)&&s.focus?.includes(p);body+=line(u.x,u.y,v.x,v.y,hot?C.amber:C.line,hot?4:2);}
    a.forEach((v,i)=>{if(v===null)return;const p=heapXY(i,compact);const hot=s.focus?.includes(i);token('heap-'+v,p.x,p.y,v,hot?C.amber:C.teal,48,48,true);body+=txt(p.x+29,p.y+5,i+1,11,C.muted);});
    if(!a.length)body+=txt(470,207,'空堆 · 等待第一个元素',23,C.muted,'middle');
    if(!small){
      label(34,27,s.mode==='delete'?'删除最小值':'待插入');
      if(s.mode==='insert'){s.pending.forEach((v,i)=>body+=rect(100+i*40,6,33,30,'#f2f5f7','none',6)+txt(116+i*40,27,v,17,C.muted,'middle'));}
      else badge(155,5,s.removed===null?'根 = 最小值':`已取出 ${s.removed}`,C.teal,130);
      badge(711,7,s.valid?'✓ 本轮堆序满足':'调整中 · 继续比较',s.valid?C.teal:C.amber,199);
      label(34,326,'层序');const start=154;
      a.forEach((v,i)=>{body+=rect(start+i*65-25,297,50,36,'#f5f8f9',s.focus?.includes(i)?C.amber:C.line,7)+txt(start+i*65,322,v===null?'空':v,20,s.focus?.includes(i)?C.amber:C.ink,'middle',600);});
      body+=txt(470,282,'按层从左到右填位置；父结点的值不大于孩子。',13,C.muted,'middle');
    }
  }
  function draw(s){
    tokens=[];body='';
    if(s.kind==='address'){
      label(56,62,'同一数组 · 每项占 4 个存储单元');badge(690,35,'已知 A[5] = 1032',C.teal,210);
      for(let i=0;i<6;i++){
        const x=113+i*141,hot=i===s.reached;
        body+=txt(x,125,`A[${i}]`,22,hot?C.teal:C.ink,'middle',600)+rect(x-54,146,108,78,hot?C.pale:'#f5f7f9',hot?C.teal:C.line,10)+txt(x,193,`第 ${i+1} 项`,19,C.ink,'middle');
        body+=txt(x,264,i>=s.reached?1012+i*4:'?',25,i===0&&s.answer?C.teal:C.ink,'middle',600);
        if(i<5){body+=txt(x+70,189,'→',22,C.muted,'middle');if(i>=s.reached)body+=txt(x+70,260,'−4',15,C.amber,'middle');}
      }
      body+=txt(470,333,s.answer?'1032 − 5 × 4 = 1012':s.reached===5?'从 A[5] 回到 A[0]，应该退几个间隔？':'A[5] 是第 6 项，但距首项只有 5 个间隔',s.answer?32:21,s.answer?C.teal:C.muted,'middle',s.answer?600:400);
      if(s.answer)body+=txt(470,375,'1012 + 5 × 4 = 1032  ✓',20,C.muted,'middle');
    }
    if(s.kind==='compare'){
      if(s.summary){
        const ys=[96,173,251,329];const rows=[['比较维度','栈 · Stack','队列 · Queue'],['插入位置','栈顶','队尾'],['删除位置','栈顶','队头'],['顺序规则','后进先出 LIFO','先进先出 FIFO']];
        rows.forEach((r,i)=>{body+=rect(48,ys[i]-34,844,64,i===0?C.pale:'#f5f7f9','none',10);r.forEach((t,j)=>body+=txt([83,345,650][j],ys[i]+7,t,i===0?22:21,j===0?C.muted:C.ink,'start',i===0?600:400));});
      }else{
        label(45,40,s.phase?'交替入出栈':'输入顺序');row(s.input,230,35,'s-',C.blue);
        body+=line(465,78,465,384);body+=txt(228,104,'栈 · 一叠盘子',23,C.ink,'middle',600)+txt(698,104,'队列 · 打印任务',23,C.ink,'middle',600);
        stack(s.stack,230,284,3,'s-');label(530,157,'队头 · 从这里离开');label(759,157,'队尾 · 从这里进入');rowSlots(3,616,207);row(s.queue,616,207,'q-');arrow(580,207,528,207);arrow(830,207,758,207);
        label(67,365,'已输出');row(s.outS,191,358,'s-',C.amber);label(510,365,'已输出');row(s.outQ,635,358,'q-',C.amber);
        body+=txt(697,284,s.phase?'队列仍然保持 A、B、C':'先进先出 FIFO',18,C.teal,'middle');
      }
    }
    if(s.kind==='legal'){
      label(36,38,'入栈顺序');row(s.input,163,32,'l-',C.blue);
      const options=['A  A D B C E','B  A C B D E','C  C B A D E','D  C B A E D'];options.forEach((v,i)=>{body+=rect(36,95+i*58,237,45,v[0]===s.option?C.pale:'#f4f7f9',v[0]===s.option?C.teal:'none',9)+txt(53,125+i*58,v,19,v[0]===s.option?C.teal:C.muted);});
      stack(s.stack,440,328,5,'l-',s.blocked);label(660,129,'当前目标输出');s.target.forEach((v,i)=>{body+=rect(651+i*47,149,40,42,i<s.output.length?C.pale:'#f3f5f7',i===s.output.length?C.amber:'none',7)+txt(671+i*47,177,v,20,i===s.output.length?C.amber:C.ink,'middle');});
      label(662,257,'已输出');row(s.output,675,296,'l-',C.amber,47);
      if(s.blocked)badge(629,346,'✕ C 挡住 B，无法取出',C.red,273);
      else if(s.output.length===5)badge(642,346,'✓ 每一步都能从栈顶取出',C.teal,263);
    }
    if(s.kind==='capacity'){
      label(30,37,'待入栈');row(s.input,142,31,'c-',C.blue,49);badge(686,13,`容量 ${s.cap}　占用 ${s.stack.length}　峰值 ${s.peak}`,s.blocked?C.red:C.teal,225);
      label(72,92,'栈 S');stack(s.stack,138,292,s.cap,'c-',s.blocked);arrow(257,211,350,211);body+=txt(303,186,'出栈即入队',13,C.muted,'middle');
      label(388,137,'队列 Q · 队头在左');rowSlots(7,403,185,66);row(s.queue,403,185,'c-',C.teal,66);label(386,260,'出队结果');rowSlots(7,403,300,66);row(s.output,403,300,'c-',C.amber,66);
      body+=txt(470,381,s.summary?'必须同时保存 a、c、d ⇒ 最小容量 3':s.blocked?'下一项 d 无法入栈：a、c 尚不能离开':'目标：b → d → c → f → e → a → g',s.summary?27:21,s.blocked?C.red:s.summary?C.teal:C.muted,'middle',s.summary?600:400);
    }
    if(s.kind==='hanoi'){
      if(s.view==='recurrence'){
        body+=txt(470,52,'搬 n 个盘，需要先后完成三个部分',25,C.ink,'middle',600);
        [['先搬 n−1 个','T(n−1)'],['移动最大盘','1'],['再搬 n−1 个','T(n−1)']].forEach((a,i)=>{const x=50+i*305;body+=rect(x,78,230,113,i===1?'#fff1de':C.pale,'none',13)+txt(x+115,115,a[0],20,C.ink,'middle')+txt(x+115,162,a[1],28,i===1?C.amber:C.teal,'middle',600);if(i<2)body+=txt(x+265,150,'+',30,C.muted,'middle');});
        body+=txt(470,245,'T(1) = 1；  T(n) = 2T(n−1) + 1 = 2ⁿ − 1',27,C.teal,'middle',600);
        for(let n=1;n<=6;n++){const x=90+(n-1)*153;body+=rect(x-52,283,104,84,n===s.count?C.pale:'#f1f5f7',n===s.count?C.teal:'none',10)+txt(x,313,`${n} 盘`,17,C.muted,'middle')+txt(x,348,`${2**n-1} 次`,25,C.ink,'middle',600);}
        body+=txt(470,399,'5 盘 → 6 盘：先搬 5 盘，再搬最大盘，再搬 5 盘；31 + 1 + 31 = 63。',17,C.muted,'middle');
      }else{
        const tasks=[`① ${s.count-1} 盘 X → Y`,`② 盘 ${s.count}：X → Z`,`③ ${s.count-1} 盘 Y → Z`];tasks.forEach((t,i)=>{body+=rect(18+i*187,16,177,44,s.rootPart===i?C.pale:'#eef3f6',s.rootPart===i?C.teal:'none',9)+txt(106+i*187,44,(s.rootPart>i?'✓ ':'')+t,16,s.rootPart===i?C.teal:C.ink,'middle',600);});
        const active=s.calls.at(-1),colors=[null,C.teal,C.blue,'#9675b5',C.amber,'#b45e72','#638e4b'];
        body+=txt(295,91,s.view==='relation'?`H(${s.count}, X, Z, Y)：先把上面 ${s.count-1} 盘当作一个任务`:'柱名固定；每次调用中的“源 / 目标 / 辅助”会改变',15,C.muted,'middle');
        for(let i=0;i<3;i++){const x=108+i*188;body+=rect(x-4,151,8,163,'#dbe3e8','none',4)+rect(x-85,315,170,8,'#bfcfd7','none',4)+txt(x,349,'XYZ'[i],25,C.ink,'middle',600);s.pegs[i].forEach((d,j)=>{const flying=s.flight&&d===s.active;token('disk-'+d,flying&&s.flight==='across'?108+s.to*188:x,flying?123:299-j*25,d,colors[d],42+d*19,22);});const role=active?(active.a===i?'源柱':active.b===i?'目标柱':'辅助柱'):(i===0?'源柱':i===2?'目标柱':'辅助柱');body+=txt(x,374,role,16,role==='目标柱'?C.amber:C.teal,'middle',600);}
        body+=txt(28,410,`已移动 ${s.moves} / ${2**s.count-1} 次`,17,C.teal,'start',600)+txt(563,410,s.rootPart===3?'✓ 所有任务完成':active?`当前处理 ${active.n} 个盘`:'一次只移动一个顶部圆盘',14,C.muted,'end');
        body+=rect(591,16,332,196,'#f4f7f9',C.line,12)+txt(608,43,'调用栈 · 最下面是当前任务',15,C.ink,'start',600);
        if(s.calls.length){s.calls.forEach((c,i)=>{const hot=i===s.calls.length-1,y=53+i*24;body+=rect(602,y,310,23,hot?C.pale:'#fff',hot?C.teal:'none',5)+txt(613,y+16,`H(${c.n}, ${'XYZ'[c.a]}, ${'XYZ'[c.b]}, ${'XYZ'[c.c]})`,14,hot?C.teal:C.muted,'start',hot?600:400)+txt(900,y+16,hot?'← 执行中':'等待返回',11,hot?C.teal:C.muted,'end');});}
        else{body+=txt(757,100,s.rootPart===3?'调用栈已清空':'H(n, 源, 目标, 辅助)',21,C.teal,'middle',600)+txt(757,140,s.rootPart===3?'最外层调用也已返回':'新调用入栈，完成后出栈',16,C.muted,'middle')+txt(757,178,'返回后，从父任务暂停处继续',15,C.muted,'middle');}
        body+=rect(591,224,332,187,'#f7f9fa',C.line,12);
        const code=['H(n, 源, 目标, 辅助)','① 若 n = 1：','    源 → 目标；返回','② H(n−1, 源, 辅助, 目标)','③ 移动盘 n：源 → 目标','④ H(n−1, 辅助, 目标, 源)'];
        code.forEach((t,i)=>{const y=251+i*28,hot=active?.line===i; if(hot)body+=rect(600,y-20,312,26,'#fff0d8','none',5);body+=txt(608,y,t,i===0?16:14,hot?C.amber:i===0?C.ink:C.muted,'start',hot||i===0?600:400);});
      }
    }
    if(s.kind==='heap')tree(s);
    if(s.kind==='growth'){
      if(s.phase<=1){tree({...s,mode:'growth'},true);body+=txt(470,384,s.phase===0?'回想：插入 1 时，哪些结点发生了交换？':'只走新结点到根的一条路径，其他分支不动。',22,C.teal,'middle');}
      else if(s.phase===2){
        for(let l=0;l<5;l++){const y=69+l*62;label(46,y+6,`深度 ${l}`);for(let i=0;i<2**l;i++)body+=rect(175+i*(480/(2**l)),y-15,Math.min(35,430/(2**l)),30,C.pale,C.teal,5);body+=txt(772,y+7,`${2**l} 个`,23,C.teal,'middle',600);}
        body+=txt(470,394,'每向下一层，最多容纳的结点数 × 2',23,C.ink,'middle',600);
      }else if(s.phase===3||s.phase===4){
        for(let i=1;i<s.n;i++){const p=Math.floor((i-1)/2),l=Math.floor(Math.log2(i+1)),pl=Math.floor(Math.log2(p+1));const x=40+(i-(2**l-1)+.5)*570/(2**l),px=40+(p-(2**pl-1)+.5)*570/(2**pl);body+=line(px,65+pl*68,x,65+l*68);}
        for(let i=0;i<s.n;i++){const l=Math.floor(Math.log2(i+1)),x=40+(i-(2**l-1)+.5)*570/(2**l);body+=`<circle cx="${x}" cy="${65+l*68}" r="${s.n>15?10:14}" fill="${C.teal}"/>`;}
        body+=rect(654,52,253,280,'#f3f8f7','none',15)+txt(780,100,'元素总数',16,C.muted,'middle')+txt(780,159,s.n,50,C.teal,'middle',600)+txt(780,217,'最多跨越父子边',16,C.muted,'middle')+txt(780,280,s.height+' 条',42,C.ink,'middle',600)+txt(340,395,`1 + 2 + … + ${2**s.height} = ${s.n}`,24,C.ink,'middle');
      }else if(s.phase===5){
        body+=txt(73,54,'规模增加很多，路径只增加几层',23,C.ink,'start',600);
        const pairs=[[1023,9],[1048575,19]];pairs.forEach(([n,h],i)=>{const x=45+i*453,hot=s.n===n;body+=rect(x,84,421,236,hot?C.pale:'#f4f6f8',hot?C.teal:C.line,15)+txt(x+210,129,'元素总数 n',16,C.muted,'middle')+txt(x+210,191,n.toLocaleString('en-US'),43,hot?C.teal:C.ink,'middle',600)+txt(x+210,266,`高度 ${h} · 最多跨 ${h} 条边`,23,C.ink,'middle');});body+=txt(470,373,'约一百万个元素，也只需要沿约二十层调整',24,C.teal,'middle',600);
      }else if(s.phase===6){
        body+=txt(470,80,'反过来：不断减半，到约 1 为止',25,C.ink,'middle',600);
        const vals=['1,048,575','524,287','262,143','…','1'];vals.forEach((v,i)=>{const x=115+i*177;body+=rect(x-73,125,146,60,i===4?C.pale:'#f2f5f7',i===4?C.teal:'none',10)+txt(x,163,v,i<3?20:25,C.ink,'middle',600);if(i<4)body+=txt(x+88,163,'÷2',16,C.amber,'middle');});
        body+=txt(470,259,'h = ⌊log₂ n⌋',43,C.teal,'middle',600)+txt(470,300,'n ≥ 1；高度按边数；图示减半取整',16,C.muted,'middle')+txt(470,371,'一条路径 × 每层固定工作量 → O(log n)',26,C.ink,'middle',600);
      }else{
        [['插入一个元素','O(log n)','最坏沿路径上浮'],['删除最小值','O(log n)','最坏沿路径下沉'],['只读取最小值','O(1)','直接查看根']].forEach((a,i)=>{const x=35+i*305;body+=rect(x,65,280,244,i<2?C.pale:'#f3f5f8','none',16)+txt(x+140,115,a[0],22,C.ink,'middle',600)+txt(x+140,192,a[1],39,i<2?C.teal:C.blue,'middle',600)+txt(x+140,266,a[2],18,C.muted,'middle');});body+=txt(470,365,'数据量翻倍，最坏调整路径约多一层',25,C.teal,'middle',600)+txt(470,397,'不表示每次走满，也不表示精确比较次数或秒数。',16,C.muted,'middle');
      }
    }
    return {body,tokens:copy(tokens)};
  }

  let moduleIndex=0,step=0,currentFrame=null,running=false,paused=false,raf=0,runId=0,speed=1,previousTokens=new Map(),animations=[],backupMode=false;
  const exams={
    1:{source:'（2025秋季期末A卷，三·3，PDF第4页，3分）',alt:'数组 A 每项占 4 个存储单元，A[5] 地址为 1032，求 A[0] 首地址。'},
    2:{source:'（2025秋季免修卷，一·1，PDF第1页，4分）',alt:'简述栈与队列的主要区别。'},
    4:{source:'（2024秋季期末A卷，一·8，PDF第2页，1分）',alt:'入栈顺序 ABCDE，不可能的出栈顺序是？A ADBCE，B ACBDE，C CBADE，D CBAED。'},
    5:{source:'（2024秋季补考卷，一·2，PDF第1页，1分）',alt:'a 至 g 依次入栈，出栈后立即入队，出队顺序 b d c f e a g，栈容量至少是？A 1，B 2，C 3，D 4。'},
    8:{source:'（2024秋季期末A卷，五·2，PDF第9页，10分）',alt:'将 4、2、5、8、3、6、10、1 依次插入空最小二叉堆，画出每次插入调整后的堆。'}
  };
  let shownExam=0;
  function updateExam(){
    const id=modules[moduleIndex].id,q=id==='address'?1:id==='compare'?2:id==='legal'?4:id==='capacity'?5:id==='heap'?8:0;
    $('examPanel').hidden=!q;document.querySelector('main').classList.toggle('has-exam',!!q);
    if(!q){shownExam=0;return;}if(shownExam===q)return;shownExam=q;$('examPanel').dataset.question=q;
    $('examLabel').textContent=q===2?'原题 · 简答':q===1?'原题 · 填空':q===8?'原题 · 构建最小堆':'原题 · 单选';
    $('examSource').textContent=exams[q].source;$('questionImage').src=`assets/q${q}.png`;$('questionImage').alt=exams[q].alt;
  }
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function miniTree(a){let b='';const xy=i=>{const l=Math.floor(Math.log2(i+1));return{x:(i-(2**l-1)+.5)*100/(2**l),y:8+l*15};};a.forEach((v,i)=>{const p=xy(i);if(i){const q=xy(Math.floor((i-1)/2));b+=line(q.x,q.y,p.x,p.y,'#bed2d9',1);}b+=`<circle cx="${p.x}" cy="${p.y}" r="6" fill="${C.teal}"/>`+txt(p.x,p.y+2.8,v,7,'white','middle',600);});return `<svg viewBox="0 0 100 60" aria-hidden="true">${b}</svg>`;}
  function renderFrame(frame,animate=true){
    currentFrame=copy(frame);const s=frame.state,scene=draw(s);animations.forEach(a=>a.cancel());animations=[];
    $('stage').innerHTML=`<svg viewBox="0 0 940 ${s.kind==='heap'?340:420}" role="img" aria-label="${esc(frame.caption)}">${scene.body}${scene.tokens.map(t=>`<g transform="translate(${t.x} ${t.y})"><g data-token="${esc(t.key)}">${t.markup}</g></g>`).join('')}</svg>`;
    const newMap=new Map(scene.tokens.map(t=>[t.key,t]));
    if(animate&&!reduced){$('stage').querySelectorAll('[data-token]').forEach(el=>{const key=el.dataset.token,t=newMap.get(key),old=previousTokens.get(key);const k=old?[{transform:`translate(${old.x-t.x}px,${old.y-t.y}px)`},{transform:'translate(0,0)'}]:[{opacity:0,transform:'scale(.75)'},{opacity:1,transform:'scale(1)'}];const anim=el.animate(k,{duration:Math.min(420,frame.hold*.75)/speed,easing:'cubic-bezier(.22,.7,.25,1)',fill:'both'});animations.push(anim);});}
    previousTokens=newMap;$('caption').textContent=frame.caption;
    const snaps=s.snapshots||[];$('snapshots').hidden=true;$('snapshotButton').hidden=snaps.length!==8;
    $('snapshots').innerHTML=snaps.map((p,i)=>`<div class="snapshot"><span>${i+1}. 插入 ${p.value}</span>${miniTree(p.heap)}</div>`).join('');
    $('sceneLabel').textContent=backupMode?`出栈顺序 · 选项 ${s.option}`:s.kind==='heap'?'树形结构 / 层序记录':s.kind==='growth'?'规模与调整路径':s.kind==='hanoi'?`${s.count} 盘汉诺塔 · X → Z`:'结构与操作';
  }
  function info(note){$('noteTitle').textContent=note.title;$('noteText').textContent=note.text;$('question').textContent=note.question;$('takeaway').textContent=note.takeaway||'';}
  function updateChrome(){
    const m=modules[moduleIndex];$('eyebrow').textContent=`CHAPTER ${String(moduleIndex+1).padStart(2,'0')} / 数据结构演示`;$('title').textContent=m.title;$('subtitle').textContent=m.subtitle;$('source').textContent=m.source;$('chapterNumber').innerHTML=`${String(moduleIndex+1).padStart(2,'0')} <small>/ 08</small>`;
    updateExam();$('hanoiTools').hidden=m.id!=='hanoi';$('diskCount').disabled=running;
    $('stepCount').textContent=backupMode?'备用过程':`讲解段 ${step} / ${m.segments.length}`;$('stepDots').innerHTML=m.segments.map((_,i)=>`<i class="${i<step?'done':''}"></i>`).join('');
    $('nextHint').textContent=running?'动画结束后会自动停住':step<m.segments.length?`接下来：${m.segments[step].label}`:moduleIndex<modules.length-1?`接下来：${modules[moduleIndex+1].title}`:'全部演示完成';
    $('nextButton').disabled=running;$('nextButton').innerHTML=running?'演示中…':step<m.segments.length?'下一步 <span>→</span>':moduleIndex<modules.length-1?'下一步 <span>→</span>':'从头回顾 <span>↻</span>';
    $('prevButton').disabled=!moduleIndex&&!step&&!backupMode;$('replayButton').disabled=!step&&!backupMode;$('pauseButton').hidden=!running;$('pauseButton').textContent=paused?'继续播放':'暂停';$('playStatus').textContent=running?(paused?'已暂停':'演示中'):'等待下一步';
  }
  function stop(){runId++;cancelAnimationFrame(raf);running=false;paused=false;animations.forEach(a=>a.cancel());animations=[];}
  function initialFrame(m){return shot(m.initial,m.intro.question);}
  function restingFrame(m,k){return k?m.segments[k-1].frames.at(-1):initialFrame(m);}
  function showRest(k){stop();backupMode=false;step=k;previousTokens.clear();const m=modules[moduleIndex];info(k?m.segments[k-1]:m.intro);renderFrame(restingFrame(m,k),false);updateChrome();}
  function goModule(i){moduleIndex=i;showRest(0);}
  function runFrames(frames,onDone){
    stop();running=true;paused=false;const id=runId;let fi=0,elapsed=0,last=performance.now();renderFrame(frames[0]);updateChrome();
    function tick(now){if(id!==runId)return;const delta=Math.min(now-last,100);last=now;if(!paused){elapsed+=delta*speed;if(elapsed>=frames[fi].hold){elapsed=0;fi++;if(fi===frames.length){running=false;paused=false;updateChrome();onDone?.();return;}renderFrame(frames[fi]);}}raf=requestAnimationFrame(tick);}
    raf=requestAnimationFrame(tick);
  }
  function next(){if(running)return;backupMode=false;const m=modules[moduleIndex];if(step===m.segments.length){goModule((moduleIndex+1)%modules.length);return;}const seg=m.segments[step];step++;info(seg);runFrames(seg.frames);}
  function previous(){if(backupMode){showRest(step);return;}if(step>0)showRest(step-1);else if(moduleIndex>0){moduleIndex--;showRest(modules[moduleIndex].segments.length);}}
  function replay(){if(backupMode){runBackup(currentFrame.state.option);return;}if(!step)return;const k=step,m=modules[moduleIndex],seg=m.segments[k-1];stop();previousTokens.clear();renderFrame(restingFrame(m,k-1),false);info(seg);runFrames(seg.frames);}
  function pause(){if(!running)return;paused=!paused;animations.forEach(a=>{if(paused)a.pause();else a.play();});updateChrome();}
  function runBackup(option){const m=modules[moduleIndex];if(!m.backups?.[option])return;stop();backupMode=true;previousTokens.clear();info({title:`选项 ${option} 的完整过程`,text:'入栈顺序始终保持 A、B、C、D、E。观察入栈与出栈如何交替进行。',question:'每次弹出的元素都在栈顶吗？',takeaway:'每一步都遵守栈顶进出，目标序列可以实现。'});runFrames(m.backups[option]);}
  $('nextButton').onclick=next;$('prevButton').onclick=previous;$('replayButton').onclick=replay;$('pauseButton').onclick=pause;
  $('fullButton').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('fullButton').textContent='请按 F11';}};
  function showMenu(){if(running&&!paused)pause();$('chapterList').innerHTML=modules.map((m,i)=>`<button data-chapter="${i}" class="${i===moduleIndex?'active':''}"><span>${String(i+1).padStart(2,'0')}</span>${esc(m.title)}<small>${m.segments.length} 段</small></button>`).join('')+`<div><button class="backup" data-backup="C">出栈顺序：选项 C</button><button class="backup" data-backup="D">出栈顺序：选项 D</button></div>`;$('menu').showModal();}
  $('menuButton').onclick=showMenu;$('closeMenu').onclick=()=>$('menu').close();
  function showQuestionNav(){
    if(running&&!paused)pause();
    const item=(i,q)=>`<button data-start="${i}" class="${i===moduleIndex?'active':''}" ${i===moduleIndex?'aria-current="page"':''}><strong>${esc(modules[i].title)}</strong><small>${esc(q?exams[q].source:modules[i].source)}</small></button>`;
    const questionNumbers=[1,2,4,5,null,8,null,null];
    $('questionNavList').innerHTML=modules.map((_,i)=>item(i,questionNumbers[i])).join('');
    $('questionNavButton').setAttribute('aria-expanded','true');$('questionNav').showModal();
  }
  $('questionNavButton').onclick=showQuestionNav;
  $('closeQuestionNav').onclick=()=>$('questionNav').close();
  $('questionNav').addEventListener('close',()=>$('questionNavButton').setAttribute('aria-expanded','false'));
  $('questionNavList').onclick=e=>{const b=e.target.closest('button[data-start]');if(!b)return;const i=Number(b.dataset.start);$('questionNav').close();goModule(i);};
  $('chapterList').onclick=e=>{const b=e.target.closest('button');if(!b)return;$('menu').close();if(b.dataset.chapter!==undefined)goModule(Number(b.dataset.chapter));else if(b.dataset.backup){if(moduleIndex!==2)goModule(2);runBackup(b.dataset.backup);}};
  $('speed').onchange=e=>{speed=Number(e.target.value);};
  $('diskCount').onchange=e=>{const n=Number(e.target.value);if(![3,4,5,6].includes(n))return;stop();modules[4]=createHanoi(n);goModule(4);};
  function openQuestion(){if(!shownExam)return;if(running&&!paused)pause();$('imageDialogTitle').textContent=$('examLabel').textContent;$('largeQuestion').src=`assets/q${shownExam}.png`;$('largeQuestion').alt=exams[shownExam].alt;$('largeSource').textContent=exams[shownExam].source;$('imageDialog').showModal();}
  $('zoomQuestion').onclick=openQuestion;$('questionImageButton').onclick=openQuestion;$('closeImage').onclick=()=>$('imageDialog').close();
  $('snapshotButton').onclick=()=>{if(running&&!paused)pause();$('snapshotGallery').innerHTML=(currentFrame.state.snapshots||[]).map((p,i)=>`<div class="snapshot"><span>第 ${i+1} 次 · 插入 ${p.value}</span>${miniTree(p.heap)}</div>`).join('');$('snapshotDialog').showModal();};$('closeSnapshots').onclick=()=>$('snapshotDialog').close();
  document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(e.repeat)return;if(e.code==='Space'){e.preventDefault();if(running)pause();else next();}else if(e.code==='ArrowRight'){e.preventDefault();next();}else if(e.code==='ArrowLeft'){e.preventDefault();previous();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused)pause();});
  // 供本地回归检查读取，不参与教学界面。
  window.DS_DEMO={modules,goModule,next,previous,replay,pause,runBackup,createHanoi,getStatus:()=>({moduleIndex,step,running,paused,backupMode,frame:copy(currentFrame)}),finishForTest:()=>{const m=modules[moduleIndex];showRest(step||m.segments.length);}};
  goModule(0);
})();
