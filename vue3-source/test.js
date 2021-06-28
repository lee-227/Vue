var lengthOfLIS = function (nums) {
  if (!nums.length) return
  let res = [0]
  let resArr = new Array(nums.length).fill(0)
  for (let i = 1; i < nums.length; i++) {
    let last = nums[res[res.length - 1]]
    if (last < nums[i]) {
      resArr[i] = res[res.length - 1]
      res.push(i)
      continue
    }
    let l = 0
    let r = res.length - 1
    while (l < r) {
      let mid = (l + r) >> 1
      if (nums[res[mid]] < nums[i]) {
        l = mid + 1
      } else {
        r = mid
      }
    }
    resArr[i] = resArr[res[l]]
    res[l] = i
  }
  let len = res.length
  let last = [nums[res[len - 1]]]
  while (--len) {
    last.unshift(nums[resArr[res[len]]])
  }
  return last
}
console.log(lengthOfLIS([2, 3, 1, 5, 6, 8, 7, 9, 4]))
