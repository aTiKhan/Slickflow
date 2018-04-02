﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Slickflow.Data;
using Slickflow.Engine.Common;
using Slickflow.Engine.Business.Entity;

namespace Slickflow.Engine.Xpdl.Node
{
    /// <summary>
    /// 多实例节点类型
    /// </summary>
    internal class MultipleInstanceNode : NodeBase
    {
        internal MultipleInstanceNode(ActivityEntity activity) :
            base(activity)
        {

        }
    }
}
